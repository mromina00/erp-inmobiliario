const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  personas: {
    getAll: () => ipcRenderer.invoke('personas:getAll'),
    create: (data) => ipcRenderer.invoke('personas:create', data),
  },
})