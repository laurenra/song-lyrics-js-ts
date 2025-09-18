const path = require('path');

module.exports = {
  entry: {
    // app: './js/song-lyrics-js-ts.js',
    app: './src/ts/main.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'), // set output path to /dist
    clean: true,
    filename: './js/song-lyrics-js-ts.js',
  },
  devtool: 'source-map' // generate source maps for easier debugging
};
