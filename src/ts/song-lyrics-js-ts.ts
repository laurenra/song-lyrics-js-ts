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
 *
 * TODO: Fix edit text with odd numbered lines.
 * TODO: Fix displaying 3 lines (or 4 or 1), when it loads from file, it cuts off the last rows instead of padding with blank lines
 * TODO: what happens if someone enters number out of range? Does it reset to max or min? Or do I have to do that?
 * TODO: Up down arrow keys move to previous and next lines
 */

interface verse {
  verseNum: string,
  verseText: string
}

class Lyrics {

  private isShowLyrics: boolean;
  private lyricsText: string;
  private lyricsArray: string[];
  private lyricsArrayLen: number;
  private lyricsIndex: number;
  private lyricsRowCount: number;
  private verseNumberRowCount: number;
  private displayLines: number;
  private displayLinesMax: number;
  private lyricsToDisplay: string;
  private previewRowIndex: number;
  private fileLocation: string;
  private lyrics: verse[];

  constructor() {
    this.isShowLyrics = false;
    this.lyricsText = "";
    this.lyricsArray = [];
    this.lyricsArrayLen = 0;
    this.lyricsIndex = 0;
    this.lyricsRowCount = 0;
    this.verseNumberRowCount = 0;
    this.lyricsToDisplay = "";
    this.previewRowIndex = 0;
    this.fileLocation = "";
    this.displayLines = 2; // must be in constructor
    this.displayLinesMax = 20; // must be in constructor
    // this.lyrics = [{ verseNum: "1", verseText: "blah blah" }];
    this.lyrics = [];

    this.initLinesToDisplay();
  }

  setDefaults() {
    this.isShowLyrics = false;
    this.lyricsText = "";
    this.lyricsArray = [];
    this.lyricsArrayLen = 0;
    this.lyricsIndex = 0;
    this.lyricsRowCount = 0;
    this.verseNumberRowCount = 0;
    this.lyricsToDisplay = "";
    this.previewRowIndex = 0;
    this.initLinesToDisplay();
    // this.parseLyrics("[ti:Let's Twist]Praise God, from whom all blessing flow"); // testing only
  }

  /**
   * 1. Count all rows of lyrics (separated by newlines).
   * 2. Count any rows that are just a verse number.
   * - lyricsRowCount is all rows minus any that are just verse numbers.
   * - verseNumberRowCount is all rows that are just verse numbers.
   *
   * Test regex at https://regex101.com/
   *
   * @param lyricsData
   * out:  this.lyricsRowCount, this.verseNumberRowCount
   */
  countLyricsRows(lyricsData: string) {
    const regex= /^[0-9]+$/; // RegEx for lines with only numbers (verse number)
    let verseNumLines = 0;
    const lines = lyricsData.split(/\r\n|\n|\r/);
    if (lines.length > 0) {
      for (const line of lines) {
        if (line.trim().match(regex)) {
          verseNumLines++;
        }
      }
    }
    this.lyricsRowCount = lines.length - verseNumLines;
    this.verseNumberRowCount = verseNumLines;
  }

/**
   * Get min, max, and default value for displayLines from HTML <input> element.
   * Stay between 1 and 99 regardless of what's set in the element.
   *
   * out: this.displayLines, this.displayLinesMax
   */
  initLinesToDisplay() {
    const displayLinesElement = document.getElementById("displayLines") as HTMLInputElement;
    if (displayLinesElement) {
      const max: number = parseInt(displayLinesElement.max);
      if (max > 99) {
        let max = 99;
        displayLinesElement.max = max.toString(); // reset to 99
      }
      this.displayLinesMax = max;

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
      this.displayLines = val;
    }
  }

  /**
   * Read lyrics from <textarea id=lyricsEditor>, initialize variables,
   * clear the lyrics display green screen, show the Show Lyrics button.
   *
   * out: this.lyricsText, this.lyricsArray, this.lyricsArrayLen
   */
  initLyricsToPreview() {
    const lyrics = document.getElementById("lyricsEditor") as HTMLTextAreaElement;
    if (lyrics) {
      this.setDefaults();
      const lyricsText = lyrics.value;
      // this.parseLyrics(lyricsText);
      if (lyricsText) {
        if (lyricsText?.length > 0) {
          this.lyricsText = lyricsText;
          this.lyricsArray = this.lyricsText.split("\n");
          this.lyricsArrayLen = this.lyricsArray.length;
          this.countLyricsRows(lyricsText); // set this.lyricsRowCount, this.verseNumberRowCount
          this.copyLyricsToPreview();
        }
      }
      this.hideLyricsButton();
    }
  }

  /**
   * Get lyrics from editor textarea and copy to the preview area.
   * 1. Calculate number of table rows =
   *      next higher integer of (lyricsRowCount / lines to display at a time)
   *      plus number of rows that are just verse numbers.
   * 2. Delete existing rows in table.
   * 3. Loop to create rows in the table and copy a verse number or a chunk of
   * lyrics to display into a row.
   * 4. Set background color of the top row (chunk of lyrics) to white.
   *
   * in:  this.lyricsArray, this.lyricsArrayLen, this.displayLines,
   *      this.lyricsRowCount, this,verseNumberCount
   */
  copyLyricsToPreview() {
    const lyrics = document.getElementById("lyricsEditor") as HTMLTextAreaElement;
    if (lyrics) {
      const prvwTable = document.getElementById("previewTable") as HTMLTableElement;
      if (prvwTable) {
        // Delete existing rows and cells (does not delete <tbody>).
        while (prvwTable.rows.length > 0) {
          prvwTable.deleteRow(0);
        }

        // Number of rows to create =
        // next higher integer of (lyricsRowCount / displayLines)
        // + number of rows that are just verse numbers.
        let tblRows = (Math.ceil(this.lyricsRowCount / this.displayLines)) + this.verseNumberRowCount;
        let lyricsIndex = 0;
        let lyricsToCopy = "";

        const regex= /^[0-9]+$/; // RegEx for lines with only numbers (verse number)

        // Loop and create new rows and copy the lyrics into them.
        for (let i = 0; i < tblRows; i++) {

          // Create new row <tr> with a single cell <td>.
          const newtr = document.createElement("tr");
          // const versetd = document.createElement("td")
          const lyrictd = document.createElement("td");

          // Line with verse number only
          if (this.lyricsArray[lyricsIndex].trim().match(regex)) {
            lyricsToCopy = this.lyricsArray[lyricsIndex].trim();
            lyricsIndex = lyricsIndex + 1; // Advance only 1 line to the next row in the array to copy.
          }
          // Line with lyrics
          else {
            lyricsToCopy = this.getLyricsToDisplay(this.lyricsArray, lyricsIndex, this.lyricsArrayLen, this.displayLines);

            // If first row of lyrics, set background color to white instead of grey.
            if (lyricsIndex < this.displayLines) {
              lyrictd.style.backgroundColor = "white"; // initialize first row with white background
              this.lyricsToDisplay = lyricsToCopy; // initialize lyricsToDisplay with first row(s)
            }

            lyricsIndex = lyricsIndex + this.displayLines; // Advance to the next row(s) in the array to copy.
          }

          lyrictd.innerHTML = lyricsToCopy;
          newtr.appendChild(lyrictd);
          prvwTable.tBodies[0].appendChild(newtr);
        }
      }
    }
  }

  setFileToRead(filePath: string) {
    this.fileLocation = filePath;
  }

  /**
   * File input handler
   *
   * The context (this) is the same as the value of the
   * currentTarget property of the calling element, as well as the Event it
   * passes in; in this case the <input> element in the HTML.
   */
  handleInputFile(event: Event) {
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
  tableRowOnClick(event: Event) {
    const rowEl = event.target as HTMLTableRowElement;
    const rowTr = rowEl.closest("tr");
    const rownum = rowTr?.rowIndex;
    if (rownum || rownum === 0) {
      this.goToLyricsRow(rownum);
    }
    // this.goToLyricsRow(rownum?);
  }

  /**
   * Set oninput="lyricsOnInput" to handle changes with each keypress
   *
   * @param inputText
   */
  lyricsOnChange(textarea: HTMLTextAreaElement) {
    // const lyrics = document.getElementById("lyricsEditor") as HTMLTextAreaElement;
    if (textarea.value) {
      this.setDefaults();
      const lyricsText = textarea.value;
      if (lyricsText) {
        if (lyricsText?.length > 0) {
          this.lyricsText = lyricsText;
          this.lyricsArray = this.lyricsText.split("\n");
          this.lyricsArrayLen = this.lyricsArray.length;
          this.countLyricsRows(lyricsText); // set this.lyricsRowCount, this.verseNumberRowCount
          this.copyLyricsToPreview();
        }
      }
      this.hideLyricsButton();
    }
    console.info("lyrics changed: " + textarea.value); // testing only
  }

  /**
   * Set oninput="lyricsOnInput" to handle changes with each keypress
   *
   * @param inputText
   */
  lyricsOnInput(inputText: any) {
    this.setDefaults();
    this.lyricsText = inputText.value;
    this.lyricsArray = this.lyricsText.split("\n");
    this.lyricsArrayLen = this.lyricsArray.length;
    this.setLyricsToDisplay();
  }

  /**
   * Move to next row(s) of lyrics to display.
   *
   * 1. Move index down by this.displayLines
   * 2. Move preview window down by this.displayLines
   * 3. Copy row(s) of lyrics into this.lyricsToDisplay
   * 4. Show lyrics in green screen if isShowLyrics is true
   */
  nextLyricsRow() {
    // If current line with verse number only, advance to next line in array.
    const regex= /^[0-9]+$/; // RegEx for lines with only numbers (verse number)
    if (this.lyricsArray[this.lyricsIndex].trim().match(regex)) {
      this.lyricsIndex = this.lyricsIndex + 1;
      this.previewRowIndex = this.previewRowIndex + 1;
    }

    // If not at end, move down
    if (this.lyricsIndex + this.displayLines < this.lyricsArrayLen) {

      this.lyricsIndex = this.lyricsIndex + this.displayLines; // Advance to next lines of lyrics

      const td = document.getElementById("previewTable")?.getElementsByTagName("td");
      if (td) {
        td[this.previewRowIndex].style.backgroundColor = "#cccccc";
        this.previewRowIndex = this.previewRowIndex + 1;
        td[this.previewRowIndex].style.backgroundColor = "white";
      }

      this.lyricsToDisplay = this.getLyricsToDisplay(this.lyricsArray, this.lyricsIndex, this.lyricsArrayLen, this.displayLines);
    }

    if (this.isShowLyrics) {
      this.showLyrics();
    }
  }

  /**
   * Move to previous row(s) of lyrics to display.
   *
   * 1. Move index up
   * by this.displayLines
   * 2. Move preview window up by this.displayLines
   * 3. Copy row(s) of lyrics into this.lyricsToDisplay
   * 4. Show lyrics in green screen if isShowLyrics is true
   */
  prevLyricsRow() {
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
  goToLyricsRow(row: number) {
    console.info("go to row number " + row);
    const lyricsIndex = row * this.displayLines;
    console.info("go to lyrics index " + lyricsIndex);
    if (this.lyricsIndex >= 0 && this.lyricsIndex < this.lyricsArrayLen) {

      const td = document.getElementById("previewTable")?.getElementsByTagName("td");
      if (td) {
        td[this.previewRowIndex].style.backgroundColor = "#cccccc"; // reset current row (white) back to grey
        this.previewRowIndex = row;
        this.lyricsIndex = lyricsIndex;
        td[this.previewRowIndex].style.backgroundColor = "white"; // set new row to white
      }

      this.lyricsToDisplay = this.getLyricsToDisplay(this.lyricsArray, this.lyricsIndex, this.lyricsArrayLen, this.displayLines);
      if (this.isShowLyrics) {
        this.showLyrics();
      }
    }
  }

  /**
   * Determine how many lines of lyrics can be displayed in the display area
   * at the current index and return them. If not enough to fill the display
   * area, add blank lines <br> so the display area remains the same size.
   *
   * in:  this.lyricsArray
   *      this.lyricsIndex
   *      this.lyricsArrayLen
   *      this.displayLines
   *
   * out: lyrics to display, each line separated by a newline <br>
   */
  getLyricsToDisplay(lyricsArray: string[], lyricsIndex: number, lyricsArrayLen: number, displayLines: number) : string {
    let lyricsToDisplay: string = "";
    if (lyricsIndex < lyricsArrayLen) {
      let displayPointer = lyricsIndex;
      // Loop as many times as the number of lines to display, typically 2 at a time.
      for (let i = 0; i < displayLines; i++) {
        // If display pointer is not beyond the last line of lyrics, append newline.
        if (displayPointer < lyricsArrayLen) {
          lyricsToDisplay = lyricsToDisplay + lyricsArray[lyricsIndex + i].trim() + "<br>";
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

  moreLines() {
    const num = document.getElementById("displayLines") as HTMLInputElement;
    if (num) {
      if (this.displayLines < this.displayLinesMax) {
        this.displayLines = this.displayLines + 1;
        num.value = this.displayLines.toString();
      }
    }
  }

  lessLines() {
    const num = document.getElementById("displayLines") as HTMLInputElement;
    if (num) {
      if (this.displayLines > 1) {
        this.displayLines = this.displayLines - 1;
        num.value = this.displayLines.toString();
      }
    }
  }


  /**
   * THIS IS ON HOLD, WORK IN PROGRESS. Only if I decide to also read .LRC files
   * with a custom tag [vs].
   *
   * LRC Format Examples:
   * [ti:Don't Be Cruel] - Title of the song
   * [ar:Elvis Presley] - Artist performing the song
   * [al:Elvis Presley's Greatest Hits] - Album
   * [au:Written by Otis Blackwell, 1961] - Author of the song
   * [lr:Otis Blackwell] - Lyricist of the song
   * [length: 2:04] - Length of the song in mm:ss
   * [by:Lauren Anderson] - Author of the LRC file
   * [offset:+500] - Global offset in milliseconds, so lyrics appear sooner (+) or later (-) than the time stamps
   * [#:These are comments] - Comments
   *
   * Unofficial LRC tags used only for this web application:
   * [cl:Hymns of the Church of Jesus Christ of Latter-Day Saints] - Collection or book
   * [no:25] - Hymn number
   * [vs:1] - Verse number
   *
   * Example:
   * [ti:Hope of Israel]
   * [cl:Hymns-For Home and Church]
   * [no:1010]
   * [vs:1]
   * Amazing grace—how sweet the sound—
   * That saved a wretch like me!
   * I once was lost, but now am found,
   * Was blind, but now I see.
   * [vs:2]
   * The Lord has promised good to me;
   * His word my hope secures.
   * He will my shield and portion be
   * As long as life endures.
   *
   */
  parseLyrics(lyricsData: string) {
    // const regex = /\[([a-z]+)\:(.+)\]/; // RegEx for lines with LRC tags like [ti:Song Title]
    const regex= /\[(?<tag>[a-z]+)\:(?<text>.+)\]/g; // RegEx for lines with LRC tags like [ti:Song Title]
    // const findLrcTags = lyricsData.matchAll(regex);

    let lyrics:verse[] = [];
    let Text = "";

    // If any [vs:] tags, populate the lyrics array with the verse numbers.
    const lrcTags = lyricsData.matchAll(regex);
    for (const lrcTag of lrcTags) {
      if (lrcTag.groups?.tag == "vs") {
        // const vs:verse = {verseNum: "1", verseText: "two"};
        lyrics.push(<verse>{verseNum: lrcTag.groups?.text, verseText: ""});
      }
      // console.log("tag: " + lrcTag.groups?.tag + " text: " + lrcTag.groups?.text);
      // console.log(
      //     `Found ${lrcTag[0]} start=${lrcTag.index} end=${
      //       lrcTag.index + lrcTag[0].length
      //     }.`,
      // );
    }

    // if (findLrcTags) {
    //   console.log("number of matches: " + findLrcTags.); // testing only
    //   // If any LRC tags found (presum
    //   findLrcTags.forEach({
    //
    //   })for (let i = 0; i < findLrcTags.length; i++) {
    //     console.log('match(' + i + "): " + findLrcTags[i]); // testing only
    //   }
    // }

    // Split into array by newlines in Windows (\r\n), Linux/MacOS (\n), or old MacOS format (\r)
    const lines = lyricsData.split(/\r\n|\n|\r/);
    if (lines) {
      let lyricsIndex = 0;
      let text = "";
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const match = regex.exec(line);
        if (match) {
          // Line with LRC tag, get tag and text
          console.log("full match: " + match[0]);
          // console.log("group tag: " + match.groups?.tag);
          // console.log("group text: " + match.groups?.text);
          // const verseNum = match.groups?.text;
          i++; // Skip LRC tag row and get the next one
          lyricsIndex = lyricsIndex + 1;
        } else {
          const verseText = line;
          console.log("lyrics: " + line);
        }
      }

      // If lyrics array is already created with verse numbers, get lyrics and add them
      if (lyrics.length > 0) {
        console.log("verse tags found: " + lyrics.length); // testing only
      }
      // No verse numbers found
      else {
        console.log("NO verse tags found"); // testing only
      }

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
// fileInputElement?.addEventListener("change", myLyrics, false);
fileInputElement?.addEventListener("change", myLyrics.handleInputFile, false);

// newtr.addEventListener("click", this.tableRowOnClick.bind(this));

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
// const queryString = window.location.search;
// const urlParams = new URLSearchParams(queryString);
// const fileToRead = urlParams.get('file');
// if (fileToRead) {
//   myLyrics.setFileToRead(fileToRead);
// }

