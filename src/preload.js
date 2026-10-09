// Exposes only a single secure function to the renderer: window.td.apply(...)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('td', {
  apply: payload => ipcRenderer.invoke('apply', payload),
});
