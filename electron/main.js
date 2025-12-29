const { app, BrowserWindow, ipcMain, dialog, shell, clipboard } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const mkarchiCLI = require('./mkarchi-cli');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#1a1a1a',
    show: false // Don't show until ready
  });

  mainWindow.loadFile('index.html');

  // Show window when ready to avoid visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// IPC Handlers

// Select folder dialog
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

// Select file dialog
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt', 'md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

// Prompt for mkarchi installation/upgrade with 3 buttons
ipcMain.handle('prompt-install-mkarchi', async () => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    title: 'mkarchi Management',
    message: 'mkarchi CLI installation or upgrade required.',
    detail: 'This application requires mkarchi (v0.1.6 or higher).\n\nChoose OK to open the guide, Auto to install/upgrade via pip, or Annuler to cancel.',
    buttons: ['Annuler', 'OK', 'Auto'],
    cancelId: 0,
    defaultId: 2,
    noLink: true
  });
  return { response: result.response };
});
// Check if mkarchi is installed
ipcMain.handle('check-mkarchi', async () => {
  return await mkarchiCLI.checkInstallation();
});
// Install mkarchi via pip
ipcMain.handle('install-mkarchi', async () => {
  return await mkarchiCLI.installMkarchi();
});
// Execute mkarchi apply
ipcMain.handle('execute-apply', async (event, tree, destination) => {
  return await mkarchiCLI.executeApply(tree, destination);
});

// Execute mkarchi give
ipcMain.handle('execute-give', async (event, sourcePath, options) => {
  return await mkarchiCLI.executeGive(sourcePath, options);
});

// Save content to file
ipcMain.handle('save-to-file', async (event, content, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath || 'mkarchi-output.txt',
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled) {
    return { success: false, error: 'Save cancelled' };
  }

  try {
    await fs.writeFile(result.filePath, content, 'utf8');
    return { success: true, path: result.filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Copy to clipboard
ipcMain.handle('copy-to-clipboard', async (event, text) => {
  try {
    clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Open external URL
ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});