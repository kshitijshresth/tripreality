const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

fs.copyFileSync(
  path.join(root, 'electron', 'main.js'),
  path.join(root, 'build', 'electron.js')
);

fs.copyFileSync(
  path.join(root, 'electron', 'preload.js'),
  path.join(root, 'build', 'preload.js')
);

console.log('Copied Electron files to build/');
