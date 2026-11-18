/* TaskFlow — Electron main process (Windows desktop app).
 * Loads the production web build from dist/. */
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('node:path');

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  let mainWindow = null;

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1100,
      height: 800,
      minWidth: 380,
      minHeight: 560,
      show: false,
      title: 'TaskFlow',
      backgroundColor: '#0f172a',
      icon: path.join(__dirname, '..', 'build', 'icon.png'),
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        spellcheck: true,
      },
    });

    Menu.setApplicationMenu(null);
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    mainWindow.once('ready-to-show', () => mainWindow.show());

    // Links to other sites open in the normal browser, never inside the app window.
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (/^https?:\/\//i.test(url)) shell.openExternal(url);
      return { action: 'deny' };
    });
    mainWindow.webContents.on('will-navigate', (event, url) => {
      if (!url.startsWith('file://')) {
        event.preventDefault();
        if (/^https?:\/\//i.test(url)) shell.openExternal(url);
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
