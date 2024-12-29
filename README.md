# song-lyrics-js-ts

Display song lyrics on a green screen to be used as a Browser source in Open 
Broadcast Studio (OBS) to overlay on a video or image.

## Usage

### In a Browser
Open **index.html** in a browser. Copy lyrics into the **Song Lyrics** text area. 
Click on **Next Line** button to advance to the next lines of lyrics to display.

You only need these files to run this:

```shell
index.html
css/style.css
js/song-lyrics-js-ts.js
favicon.ico
icon.png
icon.svg
site.webmanifest
```

### In OBS
The main purpose of this application is to display lyrics overlayed on, for 
example, a live video feed in OBS.

[Lyrics overlay example in OBS (image)](img-readme/lyrics-overlay-sample.jpg)

Set it up in OBS like this.

#### Add Browser source
1. Add a **Browser** source to your scene and name it
2. Set as **Local file**
3. Browse to **index.html** and select it
4. Set **Width** to 1920 and **Height** to 1080
5. **OK** to save

[Browser source in OBS (image)](img-readme/lyrics-overlay-browser-source.jpg)

#### Add Chroma Key filter to Browser source
1. Click on **Filters**
2. Add an **Effect** Filter
3. Select **Chroma Key** and name it
4. Accept the defaults (default **Key Color Type** is **Green**)
5. **Close** to save

[Chroma Key filter in OBS (image)](img-readme/lyrics-overlay-filter-chroma-key.jpg)

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

[Drop shadow shader filter in OBS (image)](img-readme/lyrics-overlay-filter-drop-shadow-shader.jpg)

#### Interact with the Browser source to display next lyrics
Select the Interact button to open a dialog that shows the browser page with 
the Next, Prev, and Select File buttons. You can only select the next or 
previous lyrics in this dialog. If you want the lyrics to disappear at the 
end, add a couple blank lines so the Next button will eventually advance to 
the blank lines.

[Interact with Browser source in OBS (image)](img-readme/lyrics-overlay-browser-interact.jpg)

## Customize and Build project

If you make changes to the **src/ts/song-lyrics-js-ts.ts** TypeScript file, 
they must be compiled into the **js/song-lyrics-js-ts.js** JavaScript file, 
which is the code that **index.html** uses. To be able to compile, you'll need 
[Node.js and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) 
installed first to run the following in the project root directory to install 
the dependencies.

```sh
npm install
```

Then compile the modified **song-lyrics-js-ts.ts** TypeScript file into the 
JavaScript file, **js/song-lyrics-js-ts.ts** that's used by index.html.

```sh
npm run build
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
