/**
 * Event flow:
 * 1. Select file (<input> id=fileSelected handler method named handleEvent)
 * dispatches "click" event to trigger <button> id=startBtn onclick method
 * named initLyricsToPreview. There may be a better way to do this.
 *
 * Because the handleEvent context is the calling element's context (the
 * targetElement of the <input> element), it doesn't have the context of the
 * Lyrics object, and I don't know any way to get it to access the variables
 * and methods in it, like this.LyricsText. To use these methods, the text
 * from the file is copied into <textarea id=lyricsEditor>, then the file
 * input handler dispatches a "click" event to <button id=startBtn>. The
 * startBtn onClick event handler does have the context of the Lyrics object
 * and its methods, because a Lyrics object was created at the beginning of
 * the page load (see the end of this file), so it reads the lyrics text in
 * <textarea id=lyricsEditor> and populates the variables in the Lyrics object.
 */
class Lyrics {

  private isShowLyrics: boolean;
  private lyricsText: string;
  private lyricsArray: string[];
  private lyricsArrayLen: number;
  private lyricsIndex: number;
  private displayLines: number;
  private lyricsToDisplay: string;
  private previewRowIndex: number;
  private fileLocation: string;

  constructor() {
    this.isShowLyrics = false;
    this.lyricsText = "";
    this.lyricsArray = [];
    this.lyricsArrayLen = 0;
    this.lyricsIndex = 0;
    this.displayLines = 2;
    this.lyricsToDisplay = "";
    this.previewRowIndex = 0;
    this.fileLocation = "";
  }

  setDefaults() {
    this.isShowLyrics = false;
    this.lyricsText = "";
    this.lyricsArray = [];
    this.lyricsArrayLen = 0;
    this.lyricsIndex = 0;
    this.displayLines = 2;
    this.lyricsToDisplay = "";
    this.previewRowIndex = 0;
  }

  /**
   * Read lyrics from <textarea id=lyricsEditor>, initialize variables,
   * clear the lyrics display green screen, show the Show Lyrics button.
   *
   * out: this.lyricsText, this.lyricsArray, this.lyricsArrayLen
   *
   * TODO: hide the Start button (id=startBtn)? Will it still work if hidden?
   */
  initLyricsToPreview() {
    const lyrics = document.getElementById("lyricsEditor");
    if (lyrics) {
      this.setDefaults();
      const lyricsText = lyrics.textContent;
      if (lyricsText) {
        if (lyricsText?.length > 0) {
          this.lyricsText = lyricsText;
          this.lyricsArray = this.lyricsText.split("\n");
          this.lyricsArrayLen = this.lyricsArray.length;
          this.copyLyricsToPreview();
        }
      }
      this.hideLyricsButton();
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
   * in:  this.lyricsArray, this.lyricsArrayLen, this.displayLines
   */
  copyLyricsToPreview() {
    const lyrics = document.getElementById("lyricsEditor");
    if (lyrics) {
      const prvwTable = document.getElementById("previewTable") as HTMLTableElement;
      if (prvwTable) {
        // Delete existing rows and cells (doesn't delete <tbody>).
        while (prvwTable.rows.length > 0) {
          prvwTable.deleteRow(0);
        }

        // Number of rows to create = quotient (integer) of lyricsArray / displayLines
        let tblRows = Math.floor(this.lyricsArrayLen / this.displayLines);
        let lyricsIndex = 0;
        let lyricsToCopy = "";

        // Loop and create new rows and copy the lyrics into them.
        for (let i = 0; i < tblRows; i++) {
          lyricsToCopy = this.getLyricsToDisplay(this.lyricsArray, lyricsIndex, this.lyricsArrayLen, this.displayLines);

          // Create new row <td> with a single cell <td> and copy the lyrics into it.
          const newtr = document.createElement("tr");
          const newtd = document.createElement("td");
          if (i == 0) {
            newtd.style.backgroundColor = "white"; // initialize first row with white background
            this.lyricsToDisplay = lyricsToCopy; // initialize lyricsToDisplay with first row(s)
          }

          newtd.innerHTML = lyricsToCopy;
          newtr.appendChild(newtd);
          prvwTable.tBodies[0].appendChild(newtr);

          lyricsIndex = lyricsIndex + this.displayLines;
        }
      }
    }
  }

  setFileToRead(filePath: string) {
    this.fileLocation = filePath;
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
  handleEvent(event: Event) {
    let testVar = "test";
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
          const lyricsInArea = document.getElementById("lyricsEditor");
          if (lyricsInArea) {
            lyricsInArea.innerHTML = fileContent;
            testVar = "did it";
            const startBtn = document.getElementById("startBtn");
            startBtn?.dispatchEvent(new Event('click', {bubbles: true, cancelable: true}));
          }
        }
        reader.readAsText(selectedFile, 'UTF-8');
      }
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
   * When lyrics are added or edited and the user leaves the textarea or
   * changes focus to another widget:
   * 1. Reset the array and index.
   * 2. Split inputText (multiple lines of lyrics)
   *    into a string array, with each line as an element in the array.
   * 3. Display the first line(s) of lyrics in the display area.
   * 4. Copy the inputText to a read-only <textarea>.
   *
   * Note: you cannot copy and paste into the textarea when index.html is a
   * Browser Source in OBS on Mac OS and you select Interact to see it in an
   * OBS dialog box. You can press buttons, move the scroll bar, etc., but
   * can't copy or paste, but there may be a workaround. See here:
   * https://github.com/obsproject/obs-browser/issues/365
   * In particular this solution:
   * https://github.com/obsproject/obs-browser/issues/365#issuecomment-1521406666
   *
   * @param inputText
   */
  lyricsOnInput(inputText: any) {
    this.setDefaults();
    this.lyricsText = inputText.value;
    this.lyricsArray = this.lyricsText.split("\n");
    this.lyricsArrayLen = this.lyricsArray.length;
    this.setLyricsToDisplay();
    // const lyricsOutDisplay = document.getElementById("lyricsTextOut");
    // if (lyricsOutDisplay) {
    //   lyricsOutDisplay.innerHTML = this.lyricsText;
    // }
  }

  lyricsOnChange(inputText: any) {
    this.setDefaults();
    this.lyricsText = inputText.value;
    this.lyricsArray = this.lyricsText.split("\n");
    this.lyricsArrayLen = this.lyricsArray.length;
    this.setLyricsToDisplay();
    // const lyricsOutDisplay = document.getElementById("lyricsTextOut");
    // if (lyricsOutDisplay) {
    //   lyricsOutDisplay.innerHTML = this.lyricsText;
    // }
  }

  /**
   * Move down to next lyrics to display and show them if isShowLyrics is true.
   *
   * in:  this.isShowLyrics
   */
  downButton() {
    this.nextLyrics();
    if (this.isShowLyrics) {
      this.showLyrics();
    }
  }

  /**
   * Move to next row(s) of lyrics to display.
   *
   * 1. Move index down by this.displayLines
   * 2. Move preview window down by this.displayLines
   * 3. Copy row(s) of lyrics into this.lyricsToDisplay
   */
  nextLyrics() {
    if (this.lyricsIndex + this.displayLines < this.lyricsArrayLen) {
      this.lyricsIndex = this.lyricsIndex + this.displayLines;

      const td = document.getElementById("previewTable")?.getElementsByTagName("td");
      if (td) {
        td[this.previewRowIndex].style.backgroundColor = "#cccccc";
        this.previewRowIndex = this.previewRowIndex + 1;
        td[this.previewRowIndex].style.backgroundColor = "white";
      }

      this.lyricsToDisplay = this.getLyricsToDisplay(this.lyricsArray, this.lyricsIndex, this.lyricsArrayLen, this.displayLines);
    }
  }

  /**
   * Move up to previous lyrics to display and show them if isShowLyrics is true.
   *
   * in:  this.isShowLyrics
   */
  upButton() {
    this.prevLyrics();
    if (this.isShowLyrics) {
      this.showLyrics();
    }
  }

  /**
   * Move to previous row(s) of lyrics to display.
   *
   * 1. Move index up by this.displayLines
   * 2. Move preview window up by this.displayLines
   * 3. Copy row(s) of lyrics into this.lyricsToDisplay
   */
  prevLyrics() {
    if (this.lyricsIndex - this.displayLines >= 0) {
      this.lyricsIndex = this.lyricsIndex - this.displayLines;

      const td = document.getElementById("previewTable")?.getElementsByTagName("td");
      if (td) {
        td[this.previewRowIndex].style.backgroundColor = "#cccccc";
        this.previewRowIndex = this.previewRowIndex - 1;
        td[this.previewRowIndex].style.backgroundColor = "white";
      }

      this.lyricsToDisplay = this.getLyricsToDisplay(this.lyricsArray, this.lyricsIndex, this.lyricsArrayLen, this.displayLines);
    }
  }

  /**
   * Determine how many lines of lyrics can be displayed in the display area
   * at the current index and copy them into lyricsToDisplay. If not enough
   * to fill the display area, add blank lines <br> so the display area remains
   * the same size.
   *
   * in:  this.lyricsArray
   *      this.lyricsIndex
   *      this.lyricsArrayLen
   *      this.displayLines
   *
   * out: this.lyricsToDisplay
   */
  getLyricsToDisplay(lyricsArray: string[], lyricsIndex: number, lyricsArrayLen: number, displayLines: number) : string {
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
   * in:  this.lyricsArray
   *      this.lyricsIndex
   *      this.lyricsArrayLen
   *      this.displayLines
   *
   * out: this.lyricsToDisplay
   */
  setLyricsToDisplay() {
    let lyricsToDisplay: string = "";
    if (this.lyricsIndex < this.lyricsArrayLen) {
      let displayPointer = this.lyricsIndex;
      // Loop as many times as the number of lines to display, typically 2 at a time.
      for (let i = 0; i < this.displayLines; i++) {
        // If display pointer is not beyond the last line of lyrics, append newline.
        if (displayPointer < this.lyricsArrayLen) {
          lyricsToDisplay = lyricsToDisplay + this.lyricsArray[this.lyricsIndex + i] + "<br>";
        }
        // If display pointer is beyond the last line of lyrics, add empty lines.
        else {
          lyricsToDisplay = lyricsToDisplay + "<br>";
        }
        displayPointer++;
      }
      this.lyricsToDisplay = lyricsToDisplay;
    }
  }

  /**
   * Show the lyrics in the green screen area
   *
   * 1. Show the lyrics.
   * 2. Hide the Show Lyrics button.
   * 3. Show the Hide Lyrics button.
   * 4. Set this.showLyrics to true.
   *
   * out: this.isShowLyrics = true
   */
  showLyricsButton() {
    this.showLyrics();
    const showLyricsBtn = document.getElementById("showBtn");
    const hideLyrcsBtn = document.getElementById("hideBtn");
    if (showLyricsBtn && hideLyrcsBtn) {
      showLyricsBtn.style.display = "none";
      hideLyrcsBtn.style.display = "block";
    }
    this.isShowLyrics = true;
  }

  /**
   * Show the lyrics in the green screen area by copying from
   * this.lyricsToDisplay to the lyricsDisplay container.
   *
   * in:  this.lyricsToDisplay
   */
  showLyrics() {
    const lyricsDisplay = document.getElementById("lyricsDisplay");
    if (lyricsDisplay) {
      lyricsDisplay.innerHTML = this.lyricsToDisplay;
    }
  }

  /**
   * Hide the lyrics in the green screen area
   *
   * 1. Hide the lyrics.
   * 2. Show the Show Lyrics button.
   * 3. Hide the Hide Lyrics button.
   * 4. Set this.showLyrics to false.
   *
   * in:  this.lyricsToDisplay
   * out: this.isShowLyrics = false
   */
  hideLyricsButton() {
    this.hideLyrics();
    const showLyricsBtn = document.getElementById("showBtn");
    const hideLyrcsBtn = document.getElementById("hideBtn");
    if (showLyricsBtn && hideLyrcsBtn) {
      showLyricsBtn.style.display = "block";
      hideLyrcsBtn.style.display = "none";
    }
    this.isShowLyrics = false;
  }

  /**
   * Hide the lyrics in the green screen area by writing blank lines to the
   * lyricsDisplay container.
   *
   * in:  this.displayLines
   */
  hideLyrics() {
    let blankLines = "";
    for (let i = 0; i < this.displayLines; i++) {
      blankLines = blankLines + "<br>";
    }
    const lyricsDisplay = document.getElementById("lyricsDisplay");
    if (lyricsDisplay) {
      lyricsDisplay.innerHTML = blankLines;
    }
  }

  /**
   * Test changing text in the "lyricsDisplay" element.
   */
  testChange() {
    const lyricsDisplay = document.getElementById("lyricsDisplay");
    if (lyricsDisplay) {
      lyricsDisplay.innerHTML = "Hope of Israel, Zion’s army,<br>Children of the promised day,";
    }
  }

}

/**
 * Begin Program
 */

const myLyrics = new Lyrics();
myLyrics.hideLyricsButton(); // Initialize to not display lyrics.

// const td = document.getElementById("previewTable")?.getElementsByTagName("td");
// if (td) {
//   // td[0].className = "td-white";
//   td[2].style.backgroundColor = "white";
// }

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
const fileInputElement = document.getElementById("fileSelected");
fileInputElement?.addEventListener("change", myLyrics, false);


// Add event listener to handle file input from "fileSelected" input element.

/**
 * Test getting file name from URL search params. It currently does nothing.
 * There is no way to automatically load a file from a URL search parameter.
 * For security, the user must interact with the browser to get a file.
 */
// const queryString = window.location.search;
// const urlParams = new URLSearchParams(queryString);
// const fileToRead = urlParams.get('file');
// if (fileToRead) {
//   myLyrics.setFileToRead(fileToRead);
// }

