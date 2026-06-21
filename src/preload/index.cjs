const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  personas: {
    getAll: () => ipcRenderer.invoke('personas:getAll'),
    create: (data) => ipcRenderer.invoke('personas:create', data),
    update: (id, data) => ipcRenderer.invoke('personas:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('personas:delete', id),
  },
  edificios: {
    getAll: () => ipcRenderer.invoke('edificios:getAll'),
    create: (data) => ipcRenderer.invoke('edificios:create', data),
    update: (id, data) => ipcRenderer.invoke('edificios:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('edificios:delete', id),
  },
  unidades: {
    getAll: () => ipcRenderer.invoke('unidades:getAll'),
    create: (data) => ipcRenderer.invoke('unidades:create', data),
    update: (id, data) => ipcRenderer.invoke('unidades:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('unidades:delete', id),
  },
  contratos: {
    getAll: () => ipcRenderer.invoke('contratos:getAll'),
    getById: (id) => ipcRenderer.invoke('contratos:getById', id),
    create: (data, garantesIds) => ipcRenderer.invoke('contratos:create', { data, garantesIds }),
    update: (id, data, garantesIds) => ipcRenderer.invoke('contratos:update', { id, data, garantesIds }),
    delete: (id) => ipcRenderer.invoke('contratos:delete', id),
  },
  catalogos: {
    tiposDocumento: () => ipcRenderer.invoke('catalogos:tiposDocumento'),
    tiposPersona: () => ipcRenderer.invoke('catalogos:tiposPersona'),
    rolesPersona: () => ipcRenderer.invoke('catalogos:rolesPersona'),
    estadosPersona: () => ipcRenderer.invoke('catalogos:estadosPersona'),
    tiposUnidad: () => ipcRenderer.invoke('catalogos:tiposUnidad'),
    perfilesCobro: () => ipcRenderer.invoke('catalogos:perfilesCobro'),
    estadosUnidad: () => ipcRenderer.invoke('catalogos:estadosUnidad'),
    estadosContrato: () => ipcRenderer.invoke('catalogos:estadosContrato'),
    tiposIndice: () => ipcRenderer.invoke('catalogos:tiposIndice'),
    periodicidades: () => ipcRenderer.invoke('catalogos:periodicidades'),
  },
})