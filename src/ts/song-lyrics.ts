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
 * TODO: Add ability to save edited files.
 * TODO: Add button or checkbox to automatically set the largest font size for the lyrics? Currently doing it automatically every time.
 * TODO: Add button to automatically format text pasted into edit area. Remove blank lines. Add blank lines after verse numbers. Set font size.
 * TODO: Add verses numbers.
 *
 * TODO: Get line display to work for 1 to 8 lines (not just 2 lines)
 * TODO: Fix edit text with odd numbered lines.
 * TODO: Fix displaying 3 lines (or 4 or 1), when it loads from file, it cuts off the last rows instead of padding with blank lines
 */

/* GLOBAL CONSTANTS */
/*  Used to extract (decimal) number and size unit (px, pt, %, em, rem, etc.) */
/*  from a CSS size parameter ("18 px", "25%", "1.5em", etc.)                 */
const CSS_SIZE_REGEX: RegExp = /(\d*\.?\d+)\s*([a-z%]+)/;

/* GLOBAL DEFAULTS */
const DISPLAY_AREA_WIDTH: number = 1776; /* Default width of display area id=lyricsDisplay */
const FONT_FAMILY: string = "Times New Roman"; /* Default font for Display, Preview, and Edit areas */
const DISPLAY_FONT_SIZE_DEFAULT: number = 88; /* Displayed lyrics font size is 88px */
const DISPLAY_FONT_SIZE_MIN: number = 72;
const DISPLAY_FONT_SIZE_MAX: number = 108;
const DISPLAY_FONT_SIZE_STEP: number = 4; /* Change font size in 4 pixel steps */
const PREVIEW_FONT_RATIO: number = 0.432; /* Ratio of preview font size (proportional) to display font size */
const PREVIEW_TABLE_HEIGHT: number = 695; /* Preview table height is 695px */
const DISPLAY_LINE_HEIGHT: number = 110; /* Displayed lyrics line height is 110px */
const HTML_LINE_HEIGHT_RATIO: number = 1.4; /* Ratio of line height to font size */
const FONT_SIZE_UNIT: string = "px";
const SINGLE_LINE_TEXT: string = "Line";
const PLURAL_LINE_TEXT: string = "Lines";


/* GLOBAL VARIABLES */
let g_isShowLyrics: boolean = false;
let g_lyricsText: string = ""; // Raw lyrics from file with line breaks
let g_lyricsArray: string[] = []; // Each line of lyrics is copied to a string element in this array
let g_lyricsArrayLen: number = 0;
let g_lyricsIndex: number = 0; // Current cursor position in lyrics array
let g_displayLines: number = 2; // Number of lines to copy to the display area
let g_displayLinesMax: number = 8;
let g_displayFontSize: number = DISPLAY_FONT_SIZE_DEFAULT;
let g_lyricsToDisplay: string = "";
let g_previewRowIndex: number = 0;
let g_fileLocation: string = "";

interface SizeParams {
  sizeNum: number,
  sizeUnit: string
}

/**
 * Initialize element style values for lyrics display area, preview area, and edit area
 */
function initialize(): void {
  /* Set default display line height */
  (document.getElementById("lyricsDisplay") as HTMLDivElement).style.lineHeight =
      (DISPLAY_LINE_HEIGHT + FONT_SIZE_UNIT) as string;

  /* Set default preview table height */
  (document.getElementById("previewTable") as HTMLTableElement).style.height =
      (PREVIEW_TABLE_HEIGHT + FONT_SIZE_UNIT) as string;

  /* Set default display font size, preview font size, edit font size, number of edit lines, etc. */
  setDisplayFontSize(DISPLAY_FONT_SIZE_DEFAULT, FONT_SIZE_UNIT);
}

/**
 * After loading a file, initialize values of global state variables.
 */
function setDefaultsAfterFileLoad(): void {
  g_isShowLyrics = false;
  g_lyricsText = "";
  g_lyricsArray = [];
  g_lyricsArrayLen = 0;
  g_lyricsIndex = 0;
  g_lyricsToDisplay = "";
  g_previewRowIndex = 0;
  // initLinesToDisplay();
}

/**
 * Get URL Query parameters
 */
function getUrlQueryParams(): void {
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
function initLyricsToPreview(): void {
  const lyrics = document.getElementById("lyricsEditor") as HTMLTextAreaElement;
  if (lyrics) {
    setDefaultsAfterFileLoad();
    const lyricsText = lyrics.value;
    // checkLyricsTextSize(lyricsText);
    // testing only. Move this to handleFileInputEvent? Or provide a button to autosize?
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
function copyLyricsToPreview(): void {
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

        // console.info("loop " + i + ": g_lyricsArrayLen = " + g_lyricsArrayLen);

        newtd.innerHTML = lyricsToCopy;
        newtr.appendChild(newtd);
        prvwTable.tBodies[0].appendChild(newtr);

        lyricsIndex = lyricsIndex + g_displayLines;
      }
    }
  }
}

function setFileToRead(filePath: string): void {
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
function handleFileInputEvent(event: Event): void {
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

        /* Before copying content to lyricsEditor, try to find the largest font that will display the longest lyric line without wrapping to the next line */
        const font :string = g_displayFontSize + FONT_SIZE_UNIT + " " + FONT_FAMILY;
        const longestLine: string = getLongestLyricLine(fileContent, font);
        console.log("longest lyric line is " + measureLyricsLineWidth(longestLine, font) + "px: " + longestLine); // testing only
        const largestFont: number = findLargestUsableFont(longestLine);
        /* Set the largest font that will work */
        g_displayFontSize = largestFont;
        setDisplayFontSize(largestFont, FONT_SIZE_UNIT);

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
function loadFile(filePath: string): void {
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
function tableRowOnClick(event: Event): void {
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
// function lyricsOnChange(textarea: HTMLTextAreaElement): void {
//   // const lyrics = document.getElementById("lyricsEditor") as HTMLTextAreaElement;
//   if (textarea.value) {
//     setDefaultsAfterFileLoad();
//     const lyricsText = textarea.value;
//     if (lyricsText) {
//       if (lyricsText?.length > 0) {
//         g_lyricsText = lyricsText;
//         g_lyricsArray = g_lyricsText.split("\n");
//         g_lyricsArrayLen = g_lyricsArray.length;
//         copyLyricsToPreview();
//       }
//     }
//     hideLyricsButton();
//   }
//   console.info("lyrics changed: " + textarea.value); // testing only
// }

function lyricsOnChange(): void {
  const lyrics = document.getElementById("lyricsEditor") as HTMLTextAreaElement;
  // if (textarea.value) {
  if (lyrics.value) {
    setDefaultsAfterFileLoad();
    // const lyricsText = textarea.value;
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
  // console.info("lyrics changed: " + textarea.value); // testing only
  console.info("lyrics changed: " + lyrics.value); // testing only
}

/**
 * Set oninput="lyricsOnInput" to handle changes with each keypress
 *
 * @param inputText
 */
function lyricsOnInput(inputText: any): void {
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
function nextLyricsLines(): void {
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
function prevLyricsLines(): void {
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
function goToLyricsRow(row: number): void {
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
        // measureLyricsLineWidth(lyricsArray[lyricsIndex + i], g_displayFontSize + FONT_SIZE_UNIT + " " + FONT_FAMILY);
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
function setLyricsToDisplay(): void {
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
function showLyricsButton(): void {
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
function showLyrics(): void {
  const lyricsDisplay = document.getElementById("lyricsDisplay");
  if (lyricsDisplay) {
    console.log("Got lyricsDisplay element...");
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
function hideLyricsButton(): void {
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
function hideLyrics(): void {
  let blankLines = "";
  for (let i = 0; i < g_displayLines; i++) {
    blankLines = blankLines + "<br>";
  }
  const lyricsDisplay = document.getElementById("lyricsDisplay");
  if (lyricsDisplay) {
    lyricsDisplay.innerHTML = blankLines;
  }
}

function moreLinesToDisplay(): void {
  const numDiv: HTMLDivElement = document.getElementById("displayLinesValue") as HTMLDivElement;
  if (numDiv) {
    if (g_displayLines < g_displayLinesMax) {
      g_displayLines = g_displayLines + 1;
      // num.value = g_displayLines.toString();
      numDiv.innerHTML = g_displayLines.toString();

      const txtDiv: HTMLDivElement = document.getElementById("displayLinesText") as HTMLDivElement;
      if (txtDiv) {
        txtDiv.innerHTML = PLURAL_LINE_TEXT;
      }
    }
  }
}

function lessLinesToDisplay(): void {
  const numDiv = document.getElementById("displayLinesValue") as HTMLDivElement;
  if (numDiv) {
    if (g_displayLines > 1) {
      g_displayLines = g_displayLines - 1;
      // num.value = g_displayLines.toString();
      // num.innerHTML = g_displayLines.toString();
      numDiv.textContent = g_displayLines.toString();

      const txtDiv: HTMLDivElement = document.getElementById("displayLinesText") as HTMLDivElement;
      if (txtDiv) {
        if (g_displayLines > 1) {
          txtDiv.innerHTML = PLURAL_LINE_TEXT;
        }
        else {
          txtDiv.innerHTML = SINGLE_LINE_TEXT;
        }
      }

    }
  }
}

/**
 * Extract (decimal) number and size unit (px, pt, %, em, rem, etc.)
 * from a CSS size parameter ("18 px", "25%", "1.5em", etc.)
 *
 * regex: (\d*\.?\d+)\s*([a-z%]+)
 *
 * @param cssSizeStr
 * returns: {sizeNum: number, sizeUnit: string}
 */
function parseCssSize(cssSizeStr: string) : SizeParams {
  let sizeNum: number = 0;
  let sizeUnit: string = "";
  const match: RegExpMatchArray | null = cssSizeStr.match(CSS_SIZE_REGEX);
  if (match) {
    sizeNum = parseFloat(match[1]);
    sizeUnit = match[2];
  }
  return {
    sizeNum,
    sizeUnit
  }
}

/**
 * Show the Display font size
 */
function showDisplayFontSize():void {
  (document.getElementById("fontSizeText") as HTMLDivElement).textContent = (g_displayFontSize + FONT_SIZE_UNIT) as string;
}

function setPreviewPaneFontSize(mainFontSz: number, mainFontUnit: string): void {
  const prvwFontSz:number = Math.round(mainFontSz * PREVIEW_FONT_RATIO);
  (document.getElementById("lyricsPreview") as HTMLTableElement).style.fontSize = (prvwFontSz + mainFontUnit) as string;
}

function setEditPaneFontSize(mainFontSz: number, mainFontUnit: string): void {
  const editFontSz:number = Math.round(mainFontSz * PREVIEW_FONT_RATIO);
  (document.getElementById("lyricsEditor") as HTMLTextAreaElement).style.fontSize = (editFontSz + mainFontUnit) as string;
}

function setEditPaneRows(mainFontSz: number): void {
  const editElem: HTMLTextAreaElement = document.getElementById("lyricsEditor") as HTMLTextAreaElement;
  if (editElem) {
    const prvwElem:HTMLDivElement = document.getElementById("lyricsPreview") as HTMLDivElement;
    if (prvwElem) {
      const fontSize:SizeParams = parseCssSize(prvwElem.style.fontSize);
      const prvwHeight = (document.getElementById("previewTable") as HTMLTableElement).style.height;
      console.log("Edit Pane: preview font size: " + fontSize.sizeNum + fontSize.sizeUnit + ", Preview height: " + prvwHeight); // testing only
      editElem.rows = Math.round(PREVIEW_TABLE_HEIGHT / (mainFontSz * PREVIEW_FONT_RATIO * HTML_LINE_HEIGHT_RATIO));
      console.log("Edit Pane: preview table height: " + PREVIEW_TABLE_HEIGHT + ", preview font ratio: " + PREVIEW_FONT_RATIO + ", html line height ratio: " + HTML_LINE_HEIGHT_RATIO + " = " + editElem.rows); // testing only
    }
  }
}

/**
 * Set Display font size, adjust Preview font size, Edit font size, and adjust
 * number of lines to display in Edit window.
 * @param fontSize
 * @param sizeUnit
 */
function setDisplayFontSize(fontSize: number, sizeUnit: string): void {
  (document.getElementById("lyricsDisplay") as HTMLDivElement).style.fontSize = (fontSize + sizeUnit) as string;
  setPreviewPaneFontSize(fontSize, sizeUnit);
  setEditPaneFontSize(fontSize, sizeUnit);
  setEditPaneRows(fontSize);
  showDisplayFontSize();
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
 * To keep the line height and font size ratio, the line height increases
 * by 5px for every 4px the font size increases (5/4 = 125%).
 */
function fontBigger(): void {
    const newFontSize: number = g_displayFontSize + DISPLAY_FONT_SIZE_STEP; // Increment font size by step amount.
    if (newFontSize <= DISPLAY_FONT_SIZE_MAX) {
      g_displayFontSize = newFontSize; // Store new font size
      setDisplayFontSize(newFontSize, FONT_SIZE_UNIT);
    }
}

function fontSmaller(): void {
  if (g_displayFontSize > 0) {
    const newFontSize: number = g_displayFontSize - DISPLAY_FONT_SIZE_STEP; // Decrement font size by step amount.
    if (newFontSize >= DISPLAY_FONT_SIZE_MIN) {
      g_displayFontSize = newFontSize; // Save new font size
      setDisplayFontSize(newFontSize, FONT_SIZE_UNIT);
    }
  }
}

/**
 * Measure width of a line of lyrics and return the size in CSS pixels.
 *
 * @param lyricLine
 * return width of line in CSS pixels
 */
function measureLyricsLineWidth(lyricLine: string, font: string): number {
  let textWidth: number = 0;
  const testCanvas:HTMLCanvasElement = document.createElement('canvas');
  const testContext = testCanvas.getContext('2d');
  if (testContext) {
    testContext.font = font;
    const textMetrics = testContext.measureText(lyricLine);
    textWidth = Math.round(textMetrics.width);
    // console.log("(font: " + font + ", lyrics width: " + textWidth + "px) " + lyricLine);
    testCanvas.remove(); // clean up
  }
  return textWidth;
}

/**
 * Find the longest line of lyrics and return it.
 *
 * This will be used to try different font sizes to find the largest one that
 * will display the longest lyric line in the display area without wrapping to
 * the next line.
 *
 * @param lyrics: Lyrics text with each line delineated with a newline "\n"
 * @param font: Font size and family, for example "72px Times New Roman"
 *
 * return: (string) longest lyric line
 */
function getLongestLyricLine(lyrics: string, font: string): string {
  let longestLine: string = "";
  let longestLineWidth: number = 0;
  const lyricsArray: string[] = lyrics.split("\n");
  const lyricsArrayLen: number = lyricsArray.length;
  for (let i: number = 0; i < lyricsArrayLen; i++) {
    const lyricsWidth: number = measureLyricsLineWidth(lyricsArray[i], font);
    if (lyricsWidth > longestLineWidth) {
      longestLineWidth = lyricsWidth;
      longestLine = lyricsArray[i];
    }
  }
  return longestLine;
}

/**
 * Determine the largest font and return it.
 *
 * Try font sizes from smallest to largest to find the largest one that will
 * display the input lyric line in the display area without wrapping to the
 * next line.
 *
 * It actually starts below the smallest font size to check if the smallest
 * font size is the largest possible one that doesn't wrap. If it loops
 * through all the way to the largest font size, then it sets that one as
 * the largest possible one to use.
 *
 * @param lyrics: line of lyrics
 *
 * return: (number) size of largest font
 */
function findLargestUsableFont(lyrics: string): number {
  console.log("begin findLargestUsableFont..."); // testing only
  let lineWidth: number = 0;
  let largestFontSize: number = DISPLAY_FONT_SIZE_MIN; // set to smallest font size in range
  let prevFontSize: number = 0;
  let isLargestFontInRange: boolean = false;
  let isTooLong: boolean = false;
  let font: string = "";
  /* Try each font size from smallest to largest */
  for (let fontSize = DISPLAY_FONT_SIZE_MIN; fontSize <= DISPLAY_FONT_SIZE_MAX; fontSize = fontSize + DISPLAY_FONT_SIZE_STEP) {
    font = fontSize + FONT_SIZE_UNIT + " " + FONT_FAMILY;
    lineWidth = measureLyricsLineWidth(lyrics, font);
    if (lineWidth < DISPLAY_AREA_WIDTH) {
      /* Longest line will fit in display area at this font size. */
      largestFontSize = fontSize;
      isTooLong = false;
    }
    else {
      /* Longest line is too long for display area at this font size. */
      if (prevFontSize == 0) {
        /* Font size is the smallest in the allowable range. */
        largestFontSize = fontSize;
      }
      else {
        largestFontSize = prevFontSize;
      }
      isTooLong = true;
      break;
    }
    prevFontSize = fontSize;
  }
  if (isTooLong && prevFontSize == 0) {
    console.log("WARNING: longest lyric line is too long for the smallest font, " +
        largestFontSize + FONT_SIZE_UNIT + " " + FONT_FAMILY + ". (" + lyrics + ")");
    alert("WARNING: longest lyric line is too long for the smallest font, " +
        largestFontSize + FONT_SIZE_UNIT + " " + FONT_FAMILY + ".\n\n" +
        "Edit the lyrics file to shorten the following line:\n\n" + lyrics);
  }
  else {
    console.log(largestFontSize + FONT_SIZE_UNIT + " " + FONT_FAMILY + " is largest font for longest lyric line: " + lyrics); // testing only
  }
  return largestFontSize;
}

function testForLoop() {
  console.log("Do some stuff 1");
  let myOne: number = 1;
  console.log("Do some stuff 2");
  let myTwo: string = "2";
  console.log("Do some stuff 3");
  let myThree: number = 3;
  let myvar: number = 0
  for (let i=0; i<3; i++) {
    myvar = i;
    console.log("Use myOne: " + myOne);
    console.log("show me i: " + i + " and myvar: " + myvar);
  }
}


/**
 * Begin Program
 */

console.log("Starting code..."); // testing only

/* Add event listeners after the DOM is fully loaded. */
document.addEventListener('DOMContentLoaded', function() {

  initialize();
  hideLyricsButton(); // Don't display lyrics initially

  /* Button - select file */
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
  const smallerFontBtnButton = document.getElementById("smallerFontBtn");
  smallerFontBtnButton?.addEventListener("click", fontSmaller, false);

  /* Button - larger font */
  const largerFontBtnButton = document.getElementById("largerFontBtn");
  largerFontBtnButton?.addEventListener("click", fontBigger, false);

  const lyricsEditorChange = document.getElementById("lyricsEditor");
  if (lyricsEditorChange) {
    lyricsEditorChange.addEventListener("change", lyricsOnChange, false);
  }

});

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

