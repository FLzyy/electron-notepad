const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  handleContent: (callback) => ipcRenderer.on('update-content', callback)
})