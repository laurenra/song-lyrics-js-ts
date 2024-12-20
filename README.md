# song-lyrics-js-ts

Display song lyrics on a green screen to be used as a Browser source in Open 
Broadcast Studio (OBS) to overlay on a video or image.

## Usage

### In a Browser
Open **index.html** in a browser. Copy lyrics into the **Song Lyrics** text area. 
Click on **Next Line** button to advance to the next lines of lyrics to display.

### In OBS
#### Add Browser source
1. Add a **Browser** source to your scene and name it
2. Set as **Local file**
3. Browse to **index.html** and select it
4. Set **Width** to 1920 and **Height** to 1080
5. **OK** to save

#### Add Chroma Key filter to Browser source
1. Click on **Filters**
2. Add an **Effect** Filter
3. Select **Chroma Key** and name it
4. Accept the defaults (default **Key Color Type** is **Green**)
5. **Close** to save

The background color of the lyrics display area at the top is CSS Green, 
#008000, which works great with the default Key Color Type of Green in the 
Chroma Key effect filter.

#### Modify Browser source overlay
Place the browser source overlay where you want on the screen, usually at the 
bottom. It should fit perfectly in an HD video frame (1920x1080). Trim the 
lower part to see only the lyrics with the green background, which should 
appear as white text floating over your video. Press **Alt** while you use the 
mouse to drag the bottom handle up to hide everything below the lyrics 
display area.

#### Add a drop shadow and transparent color overlay
If you want a drop shadow, install the popular 
[obs-shaderfilter](https://obsproject.com/forum/resources/obs-shaderfilter.1736/), 
currently version 2.3.2 (as of June 19, 2023).

1. Select **Filters**
2. Add an **Effect Filter** and name it
3. Select **User-defined shader**
4. Select **Load shader text from file**
5. Click **Browse** to find the **drop_shadow.shader** and select it
6. Scroll down and set the following (for example):
   1. **Shadow offset x:** 3
   2. **Shadow offset y:** 3
   3. **Shadow blur size:** 3
   4. **shadow color** #ff000000 (black)



#### Interact with the Browser source to display next lyrics
Select the Interact button to open a dialog that shows the browser page with 
the Next, Prev, and Select File buttons. You can only select the next or 
previous lyrics in this dialog. If you want the lyrics to disappear at the 
end, add a couple blank lines so the Next button will eventually advance to 
the blank lines.

## Customize and Build project

If you make changes to the **song-lyrics-js-ts.ts** TypeScript file, they need 
to be compiled into the **song-lyrics-js-ts.js** JavaScript file. To be able 
to compile, install the dependencies. 

```sh
npm install
```

Then compile the modified song-lyrics-js-ts.ts TypeScript file into JavaScript.

```sh
npm run build
```

You will have to comment out the first 3 lines in the compiled 
song-lyrics-js-ts.js JavaScript file and the `exports.Lyrics = Lyrics;` line 
near the bottom for it to work properly with the index.html web page.

```typescript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lyrics = void 0;

...lots of code

exports.Lyrics = Lyrics;
```

Comment out to look like:

```typescript
// "use strict";
// Object.defineProperty(exports, "__esModule", { value: true });
// exports.Lyrics = void 0;

...lots of code

// exports.Lyrics = Lyrics;
```

Changes to **index.html** and **css/style.css** take effect immediately. You don't 
need to compile anything.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
