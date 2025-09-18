// src/set-public-path-config.js
import { setPublicPath } from "systemjs-webpack-interop";

// Replace 'your-module-name' with the name SystemJS will use to resolve your module
// and adjust the rootDirectoryLevel if your module's URL in the import map has multiple directories.
setPublicPath("your-module-name");