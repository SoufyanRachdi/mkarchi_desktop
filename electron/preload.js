const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File/Folder selection
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectFile: () => ipcRenderer.invoke('select-file'),

  // mkarchi CLI operations
  checkMkarchiInstalled: () => ipcRenderer.invoke('check-mkarchi'),
  promptInstallMkarchi: () => ipcRenderer.invoke('prompt-install-mkarchi'),
  installMkarchi: () => ipcRenderer.invoke('install-mkarchi'),
  executeApply: (tree, destination) => ipcRenderer.invoke('execute-apply', tree, destination),
  executeGive: (path, options) => ipcRenderer.invoke('execute-give', path, options),
  // File operations
  saveToFile: (content, defaultPath) => ipcRenderer.invoke('save-to-file', content, defaultPath),
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),

  syncVersion: (version) => ipcRenderer.invoke('sync-version', version),
  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});