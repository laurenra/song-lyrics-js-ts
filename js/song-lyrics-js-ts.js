"use strict";
class Lyrics {
    constructor() {
        this.lyricsText = "";
        this.lyricsArray = [];
        this.lyricsArrayLen = 0;
        this.lyricsIndex = 0;
        this.linesToDisplay = 2;
        this.fileLocation = "";
    }
    setDefaults() {
        this.lyricsText = "";
        this.lyricsArray = [];
        this.lyricsArrayLen = 0;
        this.lyricsIndex = 0;
        this.linesToDisplay = 2;
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
        let testVar = "test";
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
                // const lyricsArea = document.getElementById("lyricsTextIn");
                // Read file into lyrics text area
                const reader = new FileReader();
                // reader.onload = () => {
                //   const fileContent = reader.result as string;
                //   // console.info(`Read file ${selectedFile.name}`);
                //   console.info(`${selectedFile.name}: \n${fileContent}`); // testing only
                //   this.lyricsOnChange(fileContent);
                // }
                reader.onload = function () {
                    const fileContent = reader.result;
                    // console.info(`Read file ${selectedFile.name}`);
                    // console.info(`${selectedFile.name}: \n${fileContent}`); // testing only
                    const lyricsInArea = document.getElementById("lyricsTextIn");
                    if (lyricsInArea) {
                        // lyricsInArea.innerHTML = "";
                        lyricsInArea.innerHTML = fileContent;
                        testVar = "did it";
                    }
                    const lyricsOutArea = document.getElementById("lyricsTextOut");
                    if (lyricsOutArea) {
                        lyricsOutArea.innerHTML = fileContent;
                    }
                };
                reader.readAsText(selectedFile, 'UTF-8');
            }
        }
    }
    // const fileInputElement = document.getElementById("fileSelected");
    // if (fileInputElement) {
    //   const lyricsTextArea = document.getElementById("lyricsTextIn");
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
     * @param inputText
     */
    lyricsOnChange(inputText) {
        this.setDefaults();
        this.lyricsText = inputText.value;
        this.lyricsArray = this.lyricsText.split("\n");
        this.lyricsArrayLen = this.lyricsArray.length;
        this.displayLyrics();
        const lyricsOutDisplay = document.getElementById("lyricsTextOut");
        if (lyricsOutDisplay) {
            lyricsOutDisplay.innerHTML = this.lyricsText;
        }
    }
    /**
     * Move the cursor position to the previous line(s) of lyrics and copy them
     * to the display area. Don't go before the first line(s).
     */
    prevLyrics() {
        if (this.lyricsIndex - this.linesToDisplay >= 0) {
            this.lyricsIndex = this.lyricsIndex - this.linesToDisplay;
            this.displayLyrics();
        }
    }
    //
    // 0 Hope of Israel, Zion’s army,<br>
    // 1 Children of the promised day,
    //
    // 2 See, the Chieftain signals onward,<br>
    // 3 And the battle’s in array!
    //
    // 4 Hope of Israel, rise in might<br>
    // 5 With the sword of truth and right;
    //
    // 6 Sound the war-cry, “Watch and pray!”<br
    //   <br>
    //
    /**
     * Move the cursor position to the next line(s) of lyrics and copy them
     * to the display area. Don't go beyond the last line(s).
     * lines = 2
     * index = 6
     * arraylast = 6 (0 to 6)
     * len = 7
     */
    nextLyrics() {
        // 6 + 2 <= 7 - 1
        // 8 <= 6
        if (this.lyricsIndex + this.linesToDisplay < this.lyricsArrayLen) {
            this.lyricsIndex = this.lyricsIndex + this.linesToDisplay;
            this.displayLyrics();
        }
    }
    /**
     * Determine how many lines of lyrics can be displayed at the current index
     * and copy them to the display area. If not enough to fill the display area,
     * add blank lines <br> so the display area remains the same size.
     */
    displayLyrics() {
        let lyricsToDisplay = "";
        if (this.lyricsIndex < this.lyricsArrayLen) {
            let displayPointer = this.lyricsIndex;
            // Loop as many times as the number of lines to display, typically 2 at a time.
            for (let i = 0; i < this.linesToDisplay; i++) {
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
            const lyricsDisplay = document.getElementById("lyricsDisplay");
            if (lyricsDisplay) {
                lyricsDisplay.innerHTML = "";
                lyricsDisplay.innerHTML = lyricsToDisplay;
            }
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
const defaultLyrics = document.getElementById("lyricsTextIn");
if (defaultLyrics) {
    myLyrics.lyricsOnChange(defaultLyrics);
    const fileInputElement = document.getElementById("fileSelected");
    if (fileInputElement) {
        // Add event listener to handle lyrics added or edited in text area.
        // fileInputElement.addEventListener("change", myLyrics.handleTest, false);
        // fileInputElement.addEventListener("change", myLyrics.handleSelectedFile, false);
        fileInputElement.addEventListener("change", myLyrics, false);
    }
}
// Add event listener to handle file input from "fileSelected" input element.
// Test getting file name from URL search params. Currently does nothing.
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const fileToRead = urlParams.get('file');
if (fileToRead) {
    // const file
    myLyrics.setFileToRead(fileToRead);
}
