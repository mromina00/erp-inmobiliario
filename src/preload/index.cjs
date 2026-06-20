const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  personas: {
    getAll: () => ipcRenderer.invoke('personas:getAll'),
    create: (data) => ipcRenderer.invoke('personas:create', data),
    update: (id, data) => ipcRenderer.invoke('personas:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('personas:delete', id),
  },
  catalogos: {
    tiposDocumento: () => ipcRenderer.invoke('catalogos:tiposDocumento'),
    tiposPersona: () => ipcRenderer.invoke('catalogos:tiposPersona'),
    rolesPersona: () => ipcRenderer.invoke('catalogos:rolesPersona'),
    estadosPersona: () => ipcRenderer.invoke('catalogos:estadosPersona'),
  },
})