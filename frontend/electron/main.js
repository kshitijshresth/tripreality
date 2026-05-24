const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

const isDev = !app.isPackaged;
const buildDir = path.join(__dirname, '..', 'build');

function startStaticServer() {
  return new Promise((resolve) => {
    const mime = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.ico': 'image/x-icon',
      '.woff2': 'font/woff2',
      '.woff': 'font/woff',
      '.ttf': 'font/ttf',
    };

    const server = http.createServer((req, res) => {
      let filePath = path.join(buildDir, req.url === '/' ? 'index.html' : decodeURIComponent(req.url));
      const ext = path.extname(filePath).toLowerCase();

      fs.readFile(filePath, (err, data) => {
        if (err) {
          // Fallback to index.html for client-side routing
          fs.readFile(path.join(buildDir, 'index.html'), (err2, data2) => {
            if (err2) {
              res.writeHead(404);
              res.end('Not found');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(data2);
            }
          });
        } else {
          res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
          res.end(data);
        }
      });
    });

    server.listen(0, '127.0.0.1', () => {
      resolve(server.address().port);
    });
  });
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      allowRunningInsecureContent: false,
    },
    titleBarStyle: 'default',
  });

  win.once('ready-to-show', () => win.show());

  if (isDev) {
    await win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    const port = await startStaticServer();
    await win.loadURL(`http://127.0.0.1:${port}`);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
