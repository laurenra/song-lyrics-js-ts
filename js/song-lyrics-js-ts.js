"use strict";
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
 * TODO: UI to set number of display lines
 */
class Lyrics {
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
     */
    initLyricsToPreview() {
        const lyrics = document.getElementById("lyricsEditor");
        if (lyrics) {
            this.setDefaults();
            const lyricsText = lyrics.value;
            if (lyricsText) {
                if ((lyricsText === null || lyricsText === void 0 ? void 0 : lyricsText.length) > 0) {
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
            const prvwTable = document.getElementById("previewTable");
            if (prvwTable) {
                // Delete existing rows and cells (does not delete <tbody>).
                while (prvwTable.rows.length > 0) {
                    prvwTable.deleteRow(0);
                }
                // Number of rows to create = next higher integer of (lyricsArray / displayLines)
                let tblRows = Math.ceil(this.lyricsArrayLen / this.displayLines);
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
                    // newtr.addEventListener("click", this.tableRowOnClick);
                    // Add onclick listener and bind this context to the handler so the click event can access this.* methods.
                    // TODO Should have done this with the file input handler handleEvent() below instead of having to read the <textarea>
                    newtr.addEventListener("click", this.tableRowOnClick.bind(this));
                    console.info("loop " + i + ": this.lyricsArrayLen = " + this.lyricsArrayLen); // testing only
                    newtd.innerHTML = lyricsToCopy;
                    newtr.appendChild(newtd);
                    prvwTable.tBodies[0].appendChild(newtr);
                    lyricsIndex = lyricsIndex + this.displayLines;
                }
            }
        }
    }
    setFileToRead(filePath) {
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
    handleEvent(event) {
        const selectedFileList = event.target.files;
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
                reader.onload = function () {
                    const fileContent = reader.result;
                    // Copy file contents to lyrics editor textarea
                    const lyricsInArea = document.getElementById("lyricsEditor");
                    if (lyricsInArea) {
                        lyricsInArea.value = fileContent;
                        const startBtn = document.getElementById("startBtn");
                        startBtn === null || startBtn === void 0 ? void 0 : startBtn.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
                    }
                };
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
    tableRowOnClick(event) {
        const rowEl = event.target;
        const rowTr = rowEl.closest("tr");
        const rownum = rowTr === null || rowTr === void 0 ? void 0 : rowTr.rowIndex;
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
    lyricsOnChange(textarea) {
        // const lyrics = document.getElementById("lyricsEditor") as HTMLTextAreaElement;
        if (textarea.value) {
            this.setDefaults();
            const lyricsText = textarea.value;
            if (lyricsText) {
                if ((lyricsText === null || lyricsText === void 0 ? void 0 : lyricsText.length) > 0) {
                    this.lyricsText = lyricsText;
                    this.lyricsArray = this.lyricsText.split("\n");
                    this.lyricsArrayLen = this.lyricsArray.length;
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
    lyricsOnInput(inputText) {
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
        var _a;
        if (this.lyricsIndex + this.displayLines < this.lyricsArrayLen) {
            this.lyricsIndex = this.lyricsIndex + this.displayLines;
            const td = (_a = document.getElementById("previewTable")) === null || _a === void 0 ? void 0 : _a.getElementsByTagName("td");
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
        var _a;
        if (this.lyricsIndex - this.displayLines >= 0) {
            this.lyricsIndex = this.lyricsIndex - this.displayLines;
            const td = (_a = document.getElementById("previewTable")) === null || _a === void 0 ? void 0 : _a.getElementsByTagName("td");
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
    goToLyricsRow(row) {
        var _a;
        console.info("go to row number " + row);
        const lyricsIndex = row * this.displayLines;
        console.info("go to lyrics index " + lyricsIndex);
        if (this.lyricsIndex >= 0 && this.lyricsIndex < this.lyricsArrayLen) {
            const td = (_a = document.getElementById("previewTable")) === null || _a === void 0 ? void 0 : _a.getElementsByTagName("td");
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
    getLyricsToDisplay(lyricsArray, lyricsIndex, lyricsArrayLen, displayLines) {
        let lyricsToDisplay = "";
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
        let lyricsToDisplay = "";
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
fileInputElement === null || fileInputElement === void 0 ? void 0 : fileInputElement.addEventListener("change", myLyrics, false);
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
