// Main program file
import {Lyrics} from "./song-lyrics-js-ts";

/**
 * Begin Program
 */

console.log("Starting code..."); // testing only

// USE
const myLyrics = new Lyrics();
// myLyrics.hideLyricsButton(); // Initialize to not display lyrics.

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
// USE
// const fileInputElement = document.getElementById("fileSelected");
// fileInputElement?.addEventListener("change", myLyrics, false);

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
// const queryString = window.location.search;
// const urlParams = new URLSearchParams(queryString);
// const fileToRead = urlParams.get('file');
// if (fileToRead) {
//     myLyrics.setFileToRead(fileToRead);
// }
