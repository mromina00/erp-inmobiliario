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
  periodos: {
    getByContrato: (contratoId) => ipcRenderer.invoke('periodos:getByContrato', contratoId),
    update: (id, data) => ipcRenderer.invoke('periodos:update', { id, data }),
  },
  cuentas: {
    getAll: () => ipcRenderer.invoke('cuentas:getAll'),
    create: (data) => ipcRenderer.invoke('cuentas:create', data),
    update: (id, data) => ipcRenderer.invoke('cuentas:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('cuentas:delete', id),
  },
  libroDiario: {
    getAll: () => ipcRenderer.invoke('libroDiario:getAll'),
  },
  cobros: {
    create: (data) => ipcRenderer.invoke('cobros:create', data),
    delete: (id, periodoId) => ipcRenderer.invoke('cobros:delete', { id, periodoId }),
  },
  servicios: {
    getAll: () => ipcRenderer.invoke('servicios:getAll'),
    create: (data) => ipcRenderer.invoke('servicios:create', data),
    update: (id, data) => ipcRenderer.invoke('servicios:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('servicios:delete', id),
  },
  boletas: {
    getByServicio: (servicioId) => ipcRenderer.invoke('boletas:getByServicio', servicioId),
    create: (data) => ipcRenderer.invoke('boletas:create', data),
    update: (id, data) => ipcRenderer.invoke('boletas:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('boletas:delete', id),
    pagar: (id, cuentaId, fecha, medio, responsable) => ipcRenderer.invoke('boletas:pagar', { id, cuentaId, fecha, medio, responsable }),
  },
  dashboard: {
    getMetrics: () => ipcRenderer.invoke('dashboard:getMetrics'),
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
    imputaciones: () => ipcRenderer.invoke('catalogos:imputaciones'),
    tiposCuenta: () => ipcRenderer.invoke('catalogos:tiposCuenta'),
    monedas: () => ipcRenderer.invoke('catalogos:monedas'),
    mediosPago: () => ipcRenderer.invoke('catalogos:mediosPago'),
    tiposServicio: () => ipcRenderer.invoke('catalogos:tiposServicio'),
    estadosBoleta: () => ipcRenderer.invoke('catalogos:estadosBoleta'),
    responsablesPago: () => ipcRenderer.invoke('catalogos:responsablesPago'),
  },
})