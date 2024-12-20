var lyricsText = "Hope of Israel, Zion’s army,<br>\n" +
  "Children of the promised day,<br>\n" +
  "See, the Chieftain signals onward,<br>\n" +
  "And the battle’s in array!<br>\n" +
  "Hope of Israel, rise in might<br>\n" +
  "With the sword of truth and right;<br>\n" +
  "Sound the war-cry, “Watch and pray!”<br>\n" +
  "Vanquish ev’ry foe today.<br>\n" +
  "See the foe in countless numbers,<br>\n" +
  "Marshaled in the ranks of sin.<br>\n" +
  "Hope of Israel, on to battle;<br>\n" +
  "Now the vict’ry we must win!<br>\n" +
  "Hope of Israel, rise in might<br>\n" +
  "With the sword of truth and right;<br>\n" +
  "Sound the war-cry, “Watch and pray!”<br>\n" +
  "Vanquish ev’ry foe today.<br>\n" +
  "Strike for Zion, down with error;<br>\n" +
  "Flash the sword above the foe!<br>\n" +
  "Ev’ry stroke disarms a foeman;<br>\n" +
  "Ev’ry step we conq’ring go.<br>\n" +
  "Hope of Israel, rise in might<br>\n" +
  "With the sword of truth and right;<br>\n" +
  "Sound the war-cry, “Watch and pray!”<br>\n" +
  "Vanquish ev’ry foe today.<br>\n" +
  "Soon the battle will be over;<br>\n" +
  "Ev’ry foe of truth be down.<br>\n" +
  "Onward, onward, youth of Zion;<br>\n" +
  "Thy reward the victor’s crown.<br>\n" +
  "Hope of Israel, rise in might<br>\n" +
  "With the sword of truth and right;<br>\n" +
  "Sound the war-cry, “Watch and pray!”<br>\n" +
  "Vanquish ev’ry foe today."

function prevLyrics() {
  const number1 = 7;
  const number2 = 12;
  let sum = number1 + number2;
  document.getElementById("demo").innerHTML = "The sum of ";
}
function nextLyrics() {
  const number1 = 7;
  const number2 = 12;
  let sum = number1 + number2;
  document.getElementById("demo").innerHTML = "The sum of ";
}
function lyricsOnChange(inputText) {
  // split into text array using newlines as the line terminator
  console.info("default lyrics = " + lyricsText.value);
  let lyricsText = inputText.value;
  let lyricsArray = lyricsText.split("\n");
  console.info("lyrics = " + lyricsText);
  // document.getElementById("lyricsOut").innerHTML = lyricsText;
  document.getElementById("lyricsOutText").innerHTML = lyricsText;
}

class Lyrics {

  string lyricsTextAll
  constructor() {
    // this.lyricsArray = [];
    this.lyricsText = "Hope of Israel, Zion’s army,<br>\n"
  }

  lyricsOnChange(inputText) {
    // split into text array using newlines as the line terminator
    console.info("class default lyrics = " + this.lyricsText);
    this.lyricsText = inputText.value;
    this.lyricsArray = this.lyricsText.split("\n");
    console.info("lyrics = " + this.lyricsText);
    console.info("array size = " + this.lyricsArray.length);
    // document.getElementById("lyricsOut").innerHTML = lyricsText;
    document.getElementById("lyricsOutText").innerHTML = this.lyricsText;
  }

  prevLyrics() {
    const number1 = 7;
    const number2 = 12;
    let sum = number1 + number2;
    document.getElementById("demo").innerHTML = "The sum of ";
  }
  nextLyrics() {
    const number1 = 7;
    const number2 = 12;
    let sum = number1 + number2;
    document.getElementById("demo").innerHTML = "The sum of ";
  }

}

const myLyrics = new Lyrics();
