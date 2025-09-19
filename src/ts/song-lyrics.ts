/**
 * Overview: test
 * 1. Text is entered into to the lyrics-editor textarea, or a file is read into it.
 * 2. The raw text from the lyrics-editor textarea is copied into rows in a table
 * in the lyrics-preview.
 *   A. Each row has the amount of text that will fit into the lyricsDisplay
 *   (greenscreen) at the top that is displayed in OBS; for example 2 lines.
 *   B. When the number of lines in the lyricsDisplay changes, the rows are
 *   deleted and rows are added again, with each row containing the same number
 *   of lines of text that will display in the lyrcisDisplay at the top.
 * 3. Moving the cursor up or down or using the mouse to select a row:
 *   A. Changes the background color of that row to white. The rest of the rows
 *   are gray.
 *   B. Also copies the text in that row into the lyricsDisplay at the top.
 * 4. Clicking the eye icon toggles the visibility of the text in lyricsDisplay.
 *   A. Invisible deletes all the text and replaces with <br> for each row
 *   of text that would normally display; for example 2 <br> if there are 2
 *   rows of text.
 *   B. Visible copies the text at the cursor into lyricsDisplay.
 *
 * Event flow:
 * 1. Select file (<input> id=fileSelected handler method named handleEvent)
 * dispatches "click" event to trigger <button> id=startBtn onclick method
 * named initLyricsToPreview. There may be a better way to do this.
 *
 * Because the handleEvent context is the calling element's context (the
 * targetElement of the <input> element), it doesn't have the context of the
 * Lyrics object, and I don't know any way to get it to access the variables
 * and methods in it, like g_LyricsText. To use these methods, the text
 * from the file is copied into <textarea id=lyricsEditor>, then the file
 * input handler dispatches a "click" event to <button id=startBtn>. The
 * startBtn onClick event handler does have the context of the Lyrics object
 * and its methods, because a Lyrics object was created at the beginning of
 * the page load (see the end of this file), so it reads the lyrics text in
 * <textarea id=lyricsEditor> and populates the variables in the Lyrics object.
 *
 * TODO: Fix edit text with odd numbered lines.
 * TODO: Fix displaying 3 lines (or 4 or 1), when it loads from file, it cuts off the last rows instead of padding with blank lines
 * TODO: what happens if someone enters number out of range? Does it reset to max or min? Or do I have to do that?
 * TODO: Up down arrow keys move to previous and next lines
 */

/* GLOBAL VARIABLES */
let g_isShowLyrics: boolean = false;
let g_lyricsText: string = "";
let g_lyricsArray: string[] = [];
let g_lyricsArrayLen: number = 0;
let g_lyricsIndex: number = 0;
let g_displayLines: number = 2;
let g_displayLinesMax: number = 20;
let g_fontSize: number = 88;
let g_fontSizeMin: number = 16;
let g_fontSizeMax: number = 108;
let g_lyricsToDisplay: string = "";
let g_previewRowIndex: number = 0;
let g_fileLocation: string = "";

/**
 * After loading a file, initialize values of global state variables.
 */
function setDefaultsAfterFileLoad() {
  g_isShowLyrics = false;
  g_lyricsText = "";
  g_lyricsArray = [];
  g_lyricsArrayLen = 0;
  g_lyricsIndex = 0;
  g_lyricsToDisplay = "";
  g_previewRowIndex = 0;
  initLinesToDisplay();
}



/**
 * Get min, max, and default value for displayLines from HTML <input> element.
 * Stay between 1 and 99 regardless of what's set in the element.
 *
 * out: g_displayLines, g_displayLinesMax
 */
function initLinesToDisplay() {
  const displayLinesElement = document.getElementById("displayLines") as HTMLInputElement;
  if (displayLinesElement) {
    const max: number = parseInt(displayLinesElement.max);
    if (max > 99) {
      let _max = 99;
      displayLinesElement.max = _max.toString(); // reset to 99
    }
    g_displayLinesMax = max;

    const min: number = parseInt(displayLinesElement.min);
    if (min < 1) {
      let min = 1;
      displayLinesElement.min = min.toString(); // reset to 1
    }

    const val: number = parseInt(displayLinesElement.value);
    if (val < 1 || val > 99) {
      let val = 1;
      displayLinesElement.value = val.toString();
    }
    g_displayLines = val;
  }
}

  /**
   * Get URL query parameters
   */
function getUrlQueryParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const fileParam = urlParams.get('file');
  console.info("fileParam: " + fileParam); // testing only
  if (fileParam) {
    // g_loadFile(fileParam);
    /**
     * Test getting file name from URL search params. Does not work.
     * There is no way to automatically load a file from a URL search parameter.
     * For security (CORS policy), the user must interact with the browser to get a file.
     */
  }
  console.info("tried to load file from query param");
}

/**
 * Read lyrics from <textarea id=lyricsEditor>, initialize variables,
 * clear the lyrics display green screen, show the Show Lyrics button.
 *
 * out: g_lyricsText, g_lyricsArray, g_lyricsArrayLen
 */
function initLyricsToPreview() {
  const lyrics = document.getElementById("lyricsEditor") as HTMLTextAreaElement;
  if (lyrics) {
    setDefaultsAfterFileLoad();
    const lyricsText = lyrics.value;
    if (lyricsText) {
      if (lyricsText?.length > 0) {
        g_lyricsText = lyricsText;
        g_lyricsArray = g_lyricsText.split("\n");
        g_lyricsArrayLen = g_lyricsArray.length;
        copyLyricsToPreview();
      }
    }
    hideLyricsButton();
  }
}

// const prvwTbody = prvwTable.getElementsByTagName("tbody");
// const td = document.getElementById("previewTable")?.getElementsByTagName("td");

/**
 * Get lyrics from editor textarea and copy to the preview area.
 * 1. Calculate number of table rows = lyrics array length / lines to display at a time.
 * 2. Delete existing rows in table.
 * 3. Loop to create rows in the table and copy a chunk of lyrics to display into a row.
 * 4. Set background color of the top row (chunk of lyrics) to white.
 *
 * in:  g_lyricsArray, g_lyricsArrayLen, g_displayLines
 */
function copyLyricsToPreview() {
  const lyrics = document.getElementById("lyricsEditor") as HTMLTextAreaElement;
  if (lyrics) {
    const prvwTable = document.getElementById("previewTable") as HTMLTableElement;
    if (prvwTable) {
      // Delete existing rows and cells (does not delete <tbody>).
      while (prvwTable.rows.length > 0) {
        prvwTable.deleteRow(0);
      }

      // Number of rows to create = next higher integer of (lyricsArray / displayLines)
      let tblRows = Math.ceil(g_lyricsArrayLen / g_displayLines);
      let lyricsIndex = 0;
      let lyricsToCopy = "";

      // Loop and create new rows and copy the lyrics into them.
      for (let i = 0; i < tblRows; i++) {
        lyricsToCopy = getLyricsToDisplay(g_lyricsArray, lyricsIndex, g_lyricsArrayLen, g_displayLines);

        // Create new row <td> with a single cell <td> and copy the lyrics into it.
        const newtr = document.createElement("tr");
        const newtd = document.createElement("td");
        if (i == 0) {
          newtd.style.backgroundColor = "white"; // initialize first row with white background
          g_lyricsToDisplay = lyricsToCopy; // initialize lyricsToDisplay with first row(s)
        }

        // newtr.addEventListener("click", g_tableRowOnClick);
        // Add onclick listener and bind this context to the handler so the click event can access this.* methods.
        // TODO Should have done this with the file input handler handleEvent() below instead of having to read the <textarea>
        // newtr.addEventListener("click", tableRowOnClick.bind(this));
        newtr.addEventListener("click", tableRowOnClick);

        console.info("loop " + i + ": g_lyricsArrayLen = " + g_lyricsArrayLen); // testing only

        newtd.innerHTML = lyricsToCopy;
        newtr.appendChild(newtd);
        prvwTable.tBodies[0].appendChild(newtr);

        lyricsIndex = lyricsIndex + g_displayLines;
      }
    }
  }
}

function setFileToRead(filePath: string) {
  g_fileLocation = filePath;
}

/**
 * File input handler
 * Default event handler when addEventListener is used to add a newly created
 * Lyrics object; for example:
 *
 *   const myLyrics = new Lyrics();
 *   const fileInputElement = document.getElementById("fileSelected");
 *   fileInputElement.addEventListener("change", myLyrics, false);
 *
 * The context (this) is the same as the value of the
 * currentTarget property of the calling element, as well as the Event it
 * passes in; in this case the <input> element in the HTML.
 */
// function handleEvent(event: Event) {
function handleFileInputEvent(event: Event) {
  const selectedFileList = (event.target as HTMLInputElement).files;
  if (selectedFileList) {
    // Get only one file, the first one.
    const selectedFile = selectedFileList.item(0);
    if (selectedFile) {
      // Show filename
      const fileNameDisplay = document.getElementById("fileNameChosen");
      if (fileNameDisplay) {
        fileNameDisplay.innerHTML = selectedFile.name;
        console.info(`Got ${selectedFile.name}`); // testing only
      }
      // Read file
      const reader = new FileReader();
      reader.onload = function() {
        const fileContent = reader.result as string;
        // Copy file contents to lyrics editor textarea
        const lyricsInArea = document.getElementById("lyricsEditor") as HTMLTextAreaElement;
        if (lyricsInArea) {
          lyricsInArea.value = fileContent;
          const startBtn = document.getElementById("startBtn");
          startBtn?.dispatchEvent(new Event('click', {bubbles: true, cancelable: true}));
        }
      }
      reader.readAsText(selectedFile, 'UTF-8');
    }
  }
}

  /**
   * Test getting file name from URL search params. Does not work.
   * There is no way to automatically load a file from a URL search parameter.
   * For security (CORS policy), the user must interact with the browser to get a file.
   */
function loadFile(filePath: string) {
  if (filePath) {
    fetch(filePath)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error. Status: ${response.status}`)
          }
          return response.text();
        })
        .then((fileContent => {
          console.log('File content: ', fileContent);
          // process the file content here
        })).catch(error => {
          console.error("Error fetching file: ", error);
    });

  }
  else {
    console.log("No file parameter found in the URL");
  }
}

// const fileInputElement = document.getElementById("fileSelected");
// if (fileInputElement) {
//   const lyricsTextArea = document.getElementById("lyricsEditor");
//   fileInputElement.addEventListener("change", (event) => {
//     if (event) {
//       const file = event.target?.files[0];
//       const reader = new FileReader();
//
//       reader.onload = (e) => {
//         lyricsTextArea.textContent = e.target.result;
//       }
//     }
//   })
//   if (lyricsTextArea) {
//   }
// }


/**
 * Click on a row to move the display cursor and show those lyrics
 * @param event
 */
function tableRowOnClick(event: Event) {
  const rowEl = event.target as HTMLTableRowElement;
  const rowTr = rowEl.closest("tr");
  const rownum = rowTr?.rowIndex;
  if (rownum || rownum === 0) {
    goToLyricsRow(rownum);
  }
  // goToLyricsRow(rownum?);
}

/**
 * Set oninput="lyricsOnInput" to handle changes with each keypress
 *
 * @param inputText
 */
function lyricsOnChange(textarea: HTMLTextAreaElement) {
  // const lyrics = document.getElementById("lyricsEditor") as HTMLTextAreaElement;
  if (textarea.value) {
    setDefaultsAfterFileLoad();
    const lyricsText = textarea.value;
    if (lyricsText) {
      if (lyricsText?.length > 0) {
        g_lyricsText = lyricsText;
        g_lyricsArray = g_lyricsText.split("\n");
        g_lyricsArrayLen = g_lyricsArray.length;
        copyLyricsToPreview();
      }
    }
    hideLyricsButton();
  }
  console.info("lyrics changed: " + textarea.value); // testing only
}

/**
 * Set oninput="lyricsOnInput" to handle changes with each keypress
 *
 * @param inputText
 */
function lyricsOnInput(inputText: any) {
  setDefaultsAfterFileLoad();
  g_lyricsText = inputText.value;
  g_lyricsArray = g_lyricsText.split("\n");
  g_lyricsArrayLen = g_lyricsArray.length;
  setLyricsToDisplay();
}

/**
 * Move to next row(s) of lyrics to display.
 *
 * 1. Move index down by g_displayLines
 * 2. Move preview window down by g_displayLines
 * 3. Copy row(s) of lyrics into g_lyricsToDisplay
 * 4. Show lyrics in green screen if isShowLyrics is true
 */
function nextLyricsLines() {
  if (g_lyricsIndex + g_displayLines < g_lyricsArrayLen) {
    g_lyricsIndex = g_lyricsIndex + g_displayLines;

    const td = document.getElementById("previewTable")?.getElementsByTagName("td");
    if (td) {
      td[g_previewRowIndex].style.backgroundColor = "#cccccc";
      g_previewRowIndex = g_previewRowIndex + 1;
      td[g_previewRowIndex].style.backgroundColor = "white";
    }

    g_lyricsToDisplay = getLyricsToDisplay(g_lyricsArray, g_lyricsIndex, g_lyricsArrayLen, g_displayLines);
  }

  if (g_isShowLyrics) {
    showLyrics();
  }
}

/**
 * Move to previous row(s) of lyrics to display.
 *
 * 1. Move index up by g_displayLines
 * 2. Move preview window up by g_displayLines
 * 3. Copy row(s) of lyrics into g_lyricsToDisplay
 * 4. Show lyrics in green screen if isShowLyrics is true
 */
function prevLyricsLines() {
  if (g_lyricsIndex - g_displayLines >= 0) {
    g_lyricsIndex = g_lyricsIndex - g_displayLines;

    const td = document.getElementById("previewTable")?.getElementsByTagName("td");
    if (td) {
      td[g_previewRowIndex].style.backgroundColor = "#cccccc";
      g_previewRowIndex = g_previewRowIndex - 1;
      td[g_previewRowIndex].style.backgroundColor = "white";
    }

    g_lyricsToDisplay = getLyricsToDisplay(g_lyricsArray, g_lyricsIndex, g_lyricsArrayLen, g_displayLines);
  }

  if (g_isShowLyrics) {
    showLyrics();
  }
}

/**
 * Move to next row(s) of lyrics to display.
 *
 * 1. Move index down by g_displayLines
 * 2. Move preview window down by g_displayLines
 * 3. Copy row(s) of lyrics into g_lyricsToDisplay
 */
function goToLyricsRow(row: number) {
  console.info("go to row number " + row);
  const lyricsIndex = row * g_displayLines;
  console.info("go to lyrics index " + lyricsIndex);
  if (g_lyricsIndex >= 0 && g_lyricsIndex < g_lyricsArrayLen) {

    const td = document.getElementById("previewTable")?.getElementsByTagName("td");
    if (td) {
      td[g_previewRowIndex].style.backgroundColor = "#cccccc"; // reset current row (white) back to grey
      g_previewRowIndex = row;
      g_lyricsIndex = lyricsIndex;
      td[g_previewRowIndex].style.backgroundColor = "white"; // set new row to white
    }

    g_lyricsToDisplay = getLyricsToDisplay(g_lyricsArray, g_lyricsIndex, g_lyricsArrayLen, g_displayLines);
    if (g_isShowLyrics) {
      showLyrics();
    }
  }
}

/**
 * Determine how many lines of lyrics can be displayed in the display area
 * at the current index and copy them into lyricsToDisplay. If not enough
 * to fill the display area, add blank lines <br> so the display area remains
 * the same size.
 *
 * in:  g_lyricsArray
 *      g_lyricsIndex
 *      g_lyricsArrayLen
 *      g_displayLines
 *
 * out: g_lyricsToDisplay
 */
function getLyricsToDisplay(lyricsArray: string[], lyricsIndex: number, lyricsArrayLen: number, displayLines: number) : string {
  let lyricsToDisplay: string = "";
  if (lyricsIndex < lyricsArrayLen) {
    let displayPointer = lyricsIndex;
    // Loop as many times as the number of lines to display, typically 2 at a time.
    for (let i = 0; i < displayLines; i++) {
      // If display pointer is not beyond the last line of lyrics, append newline.
      if (displayPointer < lyricsArrayLen) {
        lyricsToDisplay = lyricsToDisplay + lyricsArray[lyricsIndex + i] + "<br>";
      }
      // If display pointer is beyond the last line of lyrics, add empty lines.
      else {
        lyricsToDisplay = lyricsToDisplay + "<br>";
      }
      displayPointer++;
    }
    return lyricsToDisplay;
  }
  // I think this should never happen.
  else {
    return "Error: index beyond end of array";
  }
}

/**
 * Determine how many lines of lyrics can be displayed in the display area
 * at the current index and copy them into lyricsToDisplay. If not enough
 * to fill the display area, add blank lines <br> so the display area remains
 * the same size.
 *
 * in:  g_lyricsArray
 *      g_lyricsIndex
 *      g_lyricsArrayLen
 *      g_displayLines
 *
 * out: g_lyricsToDisplay
 */
function setLyricsToDisplay() {
  let lyricsToDisplay: string = "";
  if (g_lyricsIndex < g_lyricsArrayLen) {
    let displayPointer = g_lyricsIndex;
    // Loop as many times as the number of lines to display, typically 2 at a time.
    for (let i = 0; i < g_displayLines; i++) {
      // If display pointer is not beyond the last line of lyrics, append newline.
      if (displayPointer < g_lyricsArrayLen) {
        lyricsToDisplay = lyricsToDisplay + g_lyricsArray[g_lyricsIndex + i] + "<br>";
      }
      // If display pointer is beyond the last line of lyrics, add empty lines.
      else {
        lyricsToDisplay = lyricsToDisplay + "<br>";
      }
      displayPointer++;
    }
    g_lyricsToDisplay = lyricsToDisplay;
  }
}

/**
 * Show the lyrics in the green screen area
 *
 * 1. Show the lyrics.
 * 2. Hide the Show Lyrics button.
 * 3. Show the Hide Lyrics button.
 * 4. Set g_showLyrics to true.
 *
 * out: g_isShowLyrics = true
 */
function showLyricsButton() {
  showLyrics();
  const showLyricsBtn = document.getElementById("showBtn");
  const hideLyrcsBtn = document.getElementById("hideBtn");
  if (showLyricsBtn && hideLyrcsBtn) {
    showLyricsBtn.style.display = "none";
    hideLyrcsBtn.style.display = "block";
  }
  g_isShowLyrics = true;
}

/**
 * Show the lyrics in the green screen area by copying from
 * g_lyricsToDisplay to the lyricsDisplay container.
 *
 * in:  g_lyricsToDisplay
 */
function showLyrics() {
  const lyricsDisplay = document.getElementById("lyricsDisplay");
  if (lyricsDisplay) {
    lyricsDisplay.innerHTML = g_lyricsToDisplay;
  }
}

/**
 * Hide the lyrics in the green screen area
 *
 * 1. Hide the lyrics.
 * 2. Show the Show Lyrics button.
 * 3. Hide the Hide Lyrics button.
 * 4. Set g_showLyrics to false.
 *
 * in:  g_lyricsToDisplay
 * out: g_isShowLyrics = false
 */
function hideLyricsButton() {
  hideLyrics();
  const showLyricsBtn = document.getElementById("showBtn");
  const hideLyrcsBtn = document.getElementById("hideBtn");
  if (showLyricsBtn && hideLyrcsBtn) {
    showLyricsBtn.style.display = "block";
    hideLyrcsBtn.style.display = "none";
  }
  g_isShowLyrics = false;
}

/**
 * Hide the lyrics in the green screen area by writing blank lines to the
 * lyricsDisplay container.
 *
 * in:  g_displayLines
 */
function hideLyrics() {
  let blankLines = "";
  for (let i = 0; i < g_displayLines; i++) {
    blankLines = blankLines + "<br>";
  }
  const lyricsDisplay = document.getElementById("lyricsDisplay");
  if (lyricsDisplay) {
    lyricsDisplay.innerHTML = blankLines;
  }
}

function moreLinesToDisplay() {
  const num = document.getElementById("displayLines") as HTMLInputElement;
  if (num) {
    if (g_displayLines < g_displayLinesMax) {
      g_displayLines = g_displayLines + 1;
      num.value = g_displayLines.toString();
    }
  }
}

function lessLinesToDisplay() {
  const num = document.getElementById("displayLines") as HTMLInputElement;
  if (num) {
    if (g_displayLines > 1) {
      g_displayLines = g_displayLines - 1;
      num.value = g_displayLines.toString();
    }
  }
}

function fontSmaller() {
  console.log("clicked smaller font button..."); // testing only
}

/**
 * Note: style.fontSize and style.lineHeight retrieve the property from the
 * element as string values, for example "68pt" or "96px". If the styles are
 * defined in a .css file instead of directly in the element, they return null
 * values. Use window.getComputedStyle(element).getPropertyValue('font-size')
 * to get what the DOM calculates the font size to be even if it's set from
 * a .css file.
 *
 * This means that fontSize and lineHeight must be set in the element,
 * id=lyricsDisplay.
 *
 * The computed style is always in px. If using pt instead of px, the
 * conversion from pt to px is: px = pt / 72 * 96
 *
 * We're setting the fontSize to be 80% of the lineHeight. Conversely,
 * lineHeight is 125% of fontSize, for example:
 * line-height: 110px
 * font-size: 88px
 *
 */
function fontLarger() {
  const elem = document.getElementById("lyricsDisplay") as HTMLInputElement;
  if (elem) {
    // const computedStyle = window.getComputedStyle(elem);
    // const computedFontSize = computedStyle.getPropertyValue('font-size');
    // console.log("computedFontSize: " + computedFontSize);
    // const cssFontSize = computedStyle.getPropertyValue('font-size');
    // console.log("cssFontSize: " + cssFontSize);
    console.log("style.fontSize: " + elem.style.fontSize);
    console.log("style.lineHeight: " + elem.style.lineHeight);
    elem.style.fontSize = "56pt"; // Set CSS font size.
    // const fontSizeStyle = elem.style.fontSize;
    // console.log("fontSizeStyle: " + fontSizeStyle);
    // if (g_fontSize < g_fontSizeMax) {
    //   g_fontSize = g_fontSize + 1;
    //   elem.value = g_fontSize.toString();
    // }
  }
}


/**
 * Begin Program
 */

console.log("Starting code..."); // testing only

// USE
// const myLyrics = new Lyrics();
// myLyrics.hideLyricsButton(); // Initialize to not display lyrics.
hideLyricsButton(); // Initialize to not display lyrics.

// const td = document.getElementById("previewTable")?.getElementsByTagName("td");
// if (td) {
//   // td[0].className = "td-white";
//   td[2].style.backgroundColor = "white";
// }

// Add event listeners after the DOM is fully loaded. It won't be able to find
// elements and assign listeners until the DOM is loaded.
document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('myButton');

  /**
   * Add event listener to handle lyrics added or edited in the text area. I
   * think this could also be done by setting the onChange (or onInput) method
   * in the element itself (in the index.html).
   * - the change (element onChange) event is triggered when focus leaves the
   * text area.
   * - the input (element onInput) event is triggered when the text area gets
   * input, like when a key is pressed and a character is added. It triggers
   * on each keystroke.
   */
  /* Button - FILE select */
  const inputFileElement = document.getElementById("fileSelected");
  inputFileElement?.addEventListener("change", handleFileInputEvent, false);

  /* Button - show lyrics */
  const showBtnButton = document.getElementById("showBtn");
  showBtnButton?.addEventListener("click", showLyricsButton, false);

  /* Button - hide lyrics */
  const hideBtnButton = document.getElementById("hideBtn");
  hideBtnButton?.addEventListener("click", hideLyricsButton, false);

  /* Button - move to previous lines of lyrics */
  const prevLinesBtnButton = document.getElementById("prevLinesBtn");
  prevLinesBtnButton?.addEventListener("click", prevLyricsLines, false);

  /* Button - move to next lines of lyrics */
  const nextLinesBtnButton = document.getElementById("nextLinesBtn");
  nextLinesBtnButton?.addEventListener("click", nextLyricsLines, false);

  /* invisible Button - Start (copies lyrics from Editor to Preview area) */
  const startBtnButton = document.getElementById("startBtn");
  startBtnButton?.addEventListener("click", initLyricsToPreview, false);

  /* Button - less lyrics lines to display */
  const lessLinesBtnButton = document.getElementById("lessLinesBtn");
  lessLinesBtnButton?.addEventListener("click", lessLinesToDisplay, false);

  /* Button - more lyrics lines to display */
  const moreLinesBtnButton = document.getElementById("moreLinesBtn");
  moreLinesBtnButton?.addEventListener("click", moreLinesToDisplay, false);

  /* Button - smaller font */
  const smallerFontBtnButton = document.getElementById("smallerFontBtnBtn");
  smallerFontBtnButton?.addEventListener("click", fontSmaller, false);

  /* Button - larger font */
  const largerFontBtnButton = document.getElementById("largerFontBtnBtn");
  largerFontBtnButton?.addEventListener("click", fontLarger, false);

});

// Add event listeners for up and down keys to show previous and next lyrics.
// Doesn't work because it scrolls the page or textarea elements up or down.
// document.addEventListener('keyup', myLyrics.prevLyricsRow);
// document.addEventListener('keydown', myLyrics.nextLyricsRow);



// Add event listener to handle file input from "fileSelected" input element.

/**
 * Test getting file name from URL search params. It currently does nothing.
 * There is no way to automatically load a file from a URL search parameter.
 * For security, the user must interact with the browser to get a file.
 */
// USE
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const fileToRead = urlParams.get('file');
if (fileToRead) {
    // myLyrics.setFileToRead(fileToRead);
    setFileToRead(fileToRead);
}

