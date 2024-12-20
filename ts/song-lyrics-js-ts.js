// "use strict";
// Object.defineProperty(exports, "__esModule", { value: true });
// exports.Lyrics = void 0;
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
    // File input handler stuff
    // handleInputFile() {
    //   const fileStuff = this.files;
    // }
    // readLyricsFile
    getSelectedFile() {
        const selectedFile = document.getElementById("fileIn");
        if (selectedFile) {
            const fileNameDisplay = document.getElementById("fileNameChosen");
            if (fileNameDisplay) {
                fileNameDisplay.innerHTML = "/my/new/filepath";
            }
            console.info("Got file");
        }
    }
    /**
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
                // console.info("displayLyrics loop " + i); // testing only
                // console.info("displayPointer: " + displayPointer); // testing only
                // console.info("displayLinesCount: " + displayLinesCount); // testing only
                // If display pointer is not beyond the last line of lyrics, append newline.
                if (displayPointer < this.lyricsArrayLen) {
                    lyricsToDisplay = lyricsToDisplay + this.lyricsArray[this.lyricsIndex + i] + "<br>";
                }
                // If display pointer is beyond the last line of lyrics, add empty lines.
                else {
                    lyricsToDisplay = lyricsToDisplay + "<br>";
                }
                console.info("lyricsToDisplay: " + lyricsToDisplay); // testing only
                displayPointer++;
            }
            const lyricsDisplay = document.getElementById("lyricsDisplay");
            if (lyricsDisplay) {
                lyricsDisplay.innerHTML = "";
                lyricsDisplay.innerHTML = lyricsToDisplay;
            }
        }
    }
    testChange() {
        const lyricsDisplay = document.getElementById("lyricsDisplay");
        if (lyricsDisplay) {
            lyricsDisplay.innerHTML = "Hope of Israel, Zion’s army,<br>Children of the promised day,";
        }
    }
}
// exports.Lyrics = Lyrics;
// function testDisplayTextIn() {
//   const lyricsDisplay = document.getElementById("lyricsDisplay");
//   if (lyricsDisplay) {
//     lyricsDisplay.innerHTML = "Counting: " + countit;
//   }
// }
const myLyrics = new Lyrics();
const defaultLyrics = document.getElementById("lyricsTextIn");
if (defaultLyrics) {
    myLyrics.lyricsOnChange(defaultLyrics);
}
// const fileInputElement = document.getElementById("fileIn");
// if (fileInputElement) {
//   const lyricsTextArea = document.getElementById("lyricsTextIn");
//   if (lyricsTextArea) {
//     fileInputElement.addEventListener("change", (event) => {
//       if (event) {
//         const file = event.target?.files[0];
//         const reader = new FileReader();
//
//         reader.onload = (e) => {
//           lyricsTextArea.textContent = e.target.result;
//         }
//       }
//     })
//   }
// }
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const fileToRead = urlParams.get('file');
if (fileToRead) {
    // const file
    myLyrics.setFileToRead(fileToRead);
}
// let countit = 2;
// testDisplayTextIn();
// countit = 3;
// setTimeout(testDisplayTextIn, 3000);
