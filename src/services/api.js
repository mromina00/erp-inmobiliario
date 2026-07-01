/**
 * src/services/api.js
 * Reemplaza window.api (Electron IPC) por fetch al backend FastAPI.
 * Misma firma de funciones que el preload original → cambios mínimos en las páginas.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

const get    = (path)        => request('GET',    path)
const post   = (path, body)  => request('POST',   path, body)
const patch  = (path, body)  => request('PATCH',  path, body)
const del    = (path)        => request('DELETE', path)

// ============================================================
// CATÁLOGOS
// El backend devuelve { id, descripcion } — adaptamos al formato
// original { ID_xxx, Descripcion } que usan las páginas.
// ============================================================

async function catalogo(endpoint, idKey) {
  const items = await get(endpoint)
  return items.map((i) => ({ [idKey]: i.id, Descripcion: i.descripcion }))
}

export const catalogos = {
  tiposDocumento:     () => catalogo('/api/catalogos/tipos-documento',    'ID_tipo_doc'),
  tiposPersona:       () => catalogo('/api/catalogos/tipos-persona',      'ID_tipo_persona'),
  rolesPersona:       () => catalogo('/api/catalogos/roles-persona',      'ID_rol'),
  estadosPersona:     () => catalogo('/api/catalogos/estados-persona',    'ID_estado_persona'),
  tiposUnidad:        () => catalogo('/api/catalogos/tipos-unidad',       'ID_tipo'),
  perfilesCobro:      () => catalogo('/api/catalogos/perfiles-cobro',     'ID_perfil'),
  estadosUnidad:      () => catalogo('/api/catalogos/estados-unidad',     'ID_estado_unidad'),
  estadosContrato:    () => catalogo('/api/catalogos/estados-contrato',   'ID_estado_contrato'),
  tiposIndice:        () => catalogo('/api/catalogos/tipos-indice',       'ID_indice'),
  periodicidades:     () => catalogo('/api/catalogos/periodicidades',     'ID_periodicidad'),
  imputaciones:       () => catalogo('/api/catalogos/imputaciones',       'ID_imputacion'),
  tiposCuenta:        () => catalogo('/api/catalogos/tipos-cuenta',       'ID_tipo_cuenta'),
  monedas:            () => catalogo('/api/catalogos/monedas',            'ID_moneda'),
  mediosPago:         () => catalogo('/api/catalogos/medios-pago',        'ID_medio'),
  tiposServicio:      () => catalogo('/api/catalogos/tipos-servicio',     'ID_tipo_serv'),
  estadosBoleta:      () => catalogo('/api/catalogos/estados-boleta',     'ID_estado_boleta'),
  responsablesPago:   () => catalogo('/api/catalogos/responsables-pago',  'ID_responsable'),
  marcasTarjeta:      () => catalogo('/api/catalogos/marcas-tarjeta',     'ID_marca'),
  estadosResumen:     () => catalogo('/api/catalogos/estados-resumen',    'ID_estado_resumen'),
  tiposComprobante:   () => catalogo('/api/catalogos/tipos-comprobante',  'ID_tipo_comprobante'),
  estadosVencimiento: () => catalogo('/api/catalogos/estados-vencimiento','ID_estado_vencimiento'),
  subcategoriasFlujo: async () => {
    const items = await get('/api/catalogos/subcategorias-flujo')
    return items.map((i) => ({
      ID_subcat: i.id,
      Descripcion: i.descripcion,
      Tipo_Movimiento: i.tipo_movimiento,
      Categoria_Padre: i.categoria_padre,
    }))
  },
}

// ============================================================
// EDIFICIOS
// ============================================================
export const edificios = {
  getAll:  ()           => get('/api/edificios'),
  create:  (data)       => post('/api/edificios', data),
  update:  (id, data)   => patch(`/api/edificios/${id}`, data),
  delete:  (id)         => del(`/api/edificios/${id}`),
}

// ============================================================
// PERSONAS
// ============================================================
export const personas = {
  getAll:  ()           => get('/api/personas'),
  create:  (data)       => post('/api/personas', data),
  update:  (id, data)   => patch(`/api/personas/${id}`, data),
  delete:  (id)         => del(`/api/personas/${id}`),
}

// ============================================================
// UNIDADES
// ============================================================
export const unidades = {
  getAll:  ()           => get('/api/unidades'),
  create:  (data)       => post('/api/unidades', data),
  update:  (id, data)   => patch(`/api/unidades/${id}`, data),
  delete:  (id)         => del(`/api/unidades/${id}`),
}

// ============================================================
// CONTRATOS
// ============================================================
export const contratos = {
  getAll:   ()                      => get('/api/contratos'),
  getById:  (id)                    => get(`/api/contratos/${id}`),
  // En el backend, los garantes van dentro del body del contrato
  create:   (data, garantesIds)     => post('/api/contratos', {
    ...data,
    garantes: (garantesIds || []).map((id) => ({ ID_persona_garante: id })),
  }),
  update:   (id, data, garantesIds) => patch(`/api/contratos/${id}`, data),
  delete:   (id)                    => del(`/api/contratos/${id}`),
}

// ============================================================
// PERÍODOS
// ============================================================
export const periodos = {
  getByContrato: (contratoId)       => get(`/api/contratos/${contratoId}/periodos`),
  update:        (id, data)         => {
    // El ID del período viene suelto, pero el endpoint requiere el contratoId.
    // Las páginas llaman a periodos.update(periodoId, data).
    // Guardamos el contratoId en el data si viene (DetalleContrato lo tiene).
    // Workaround: buscamos el período vía contratos al confirmar cobro.
    // Para la edición de montos usamos el endpoint directamente.
    // NOTA: el backend esponde a PATCH /api/contratos/{contratoId}/periodos/{periodoId}
    // DetalleContrato.jsx pasa el periodoId — necesitamos el contratoId del state.
    // Lo resolvemos en DetalleContrato.jsx pasando ambos. Ver el archivo adaptado.
    return Promise.reject(new Error('Usar periodos.updateConContrato(contratoId, periodoId, data)'))
  },
  updateConContrato: (contratoId, periodoId, data) =>
    patch(`/api/contratos/${contratoId}/periodos/${periodoId}`, data),
}

// ============================================================
// CUENTAS
// ============================================================
export const cuentas = {
  getAll:  ()           => get('/api/cuentas'),
  create:  (data)       => post('/api/cuentas', data),
  update:  (id, data)   => patch(`/api/cuentas/${id}`, data),
  delete:  (id)         => del(`/api/cuentas/${id}`),
}

// ============================================================
// LIBRO DIARIO
// ============================================================
export const libroDiario = {
  getAll:   ()     => get('/api/libro-diario'),
  crear:    (data) => post('/api/libro-diario', data),
  // verificar: el backend devuelve el movimiento completo (tiene Modulo_Origen)
  verificar: async (id) => {
    const mov = await get(`/api/libro-diario/${id}`)
    return {
      tieneOrigen: mov.Modulo_Origen !== 'MANUAL',
      moduloOrigen: mov.Modulo_Origen,
    }
  },
  delete:   (id)   => del(`/api/libro-diario/${id}`),
}

// ============================================================
// COBROS
// ============================================================
export const cobros = {
  getAll:  ()                    => get('/api/cobros'),
  create:  (data)                => post('/api/cobros', data),
  // En Electron recibía (id, periodoId) — en FastAPI solo necesita el id del cobro
  delete:  (id, _periodoId)      => del(`/api/cobros/${id}`),
}

// ============================================================
// TARJETAS
// ============================================================
export const tarjetas = {
  getAll:  ()           => get('/api/tarjetas'),
  create:  (data)       => post('/api/tarjetas', data),
  update:  (id, data)   => patch(`/api/tarjetas/${id}`, data),
  delete:  (id)         => del(`/api/tarjetas/${id}`),
}

// ============================================================
// GASTOS
// ============================================================
export const gastos = {
  // En Electron: getByTarjeta(tarjetaId) — en FastAPI: GET /api/gastos?tarjeta=id
  getByTarjeta: (tarjetaId)           => get(`/api/gastos?tarjeta=${tarjetaId}`),
  // En Electron: create(data, cuotasMonto) — el backend calcula las cuotas solo
  create:       (data, _cuotasMonto)  => post('/api/gastos', data),
  delete:       (id)                  => del(`/api/gastos/${id}`),
}

// ============================================================
// RESÚMENES
// ============================================================
export const resumenes = {
  // En Electron: getByTarjeta(tarjetaId) — en FastAPI: GET /api/resumenes?tarjeta=id
  getByTarjeta: (tarjetaId)                     => get(`/api/resumenes?tarjeta=${tarjetaId}`),
  create:       (data)                          => post('/api/resumenes', data),
  // En Electron: pagar(id, cuentaId, fecha, monto, medio) — adaptamos a body
  pagar:        (id, cuentaId, fecha, monto, _medio) => post(`/api/resumenes/${id}/pagar`, {
    Fecha_Pago: fecha,
    Monto_Pagado_Real: monto,
    ID_cuenta_pago: cuentaId,
  }),
  delete:       (id)                            => del(`/api/resumenes/${id}`),
}

// ============================================================
// SERVICIOS
// ============================================================
export const servicios = {
  getAll:  ()           => get('/api/servicios'),
  create:  (data)       => post('/api/servicios', data),
  update:  (id, data)   => patch(`/api/servicios/${id}`, data),
  delete:  (id)         => del(`/api/servicios/${id}`),
}

// ============================================================
// BOLETAS
// ============================================================
export const boletas = {
  // En Electron: getByServicio(servicioId) — en FastAPI: GET /api/boletas?servicio=id
  getByServicio: (servicioId)                              => get(`/api/boletas?servicio=${servicioId}`),
  create:        (data)                                    => post('/api/boletas', data),
  update:        (id, data)                                => patch(`/api/boletas/${id}`, data),
  delete:        (id)                                      => del(`/api/boletas/${id}`),
  // En Electron: pagar(id, cuentaId, fecha, medio, responsable) — adaptamos a body
  pagar:         (id, cuentaId, fecha, _medio, _resp)      => post(`/api/boletas/${id}/pagar`, {
    Fecha_Pago: fecha,
    ID_cuenta_pago: cuentaId || null,
  }),
}

// ============================================================
// VENCIMIENTOS
// ============================================================
export const vencimientos = {
  getAll:       ()           => get('/api/vencimientos'),
  // En Electron existía getProximos() — lo simulamos filtrando en cliente
  getProximos:  async () => {
    const hoy = new Date()
    const en30 = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000)
    const todos = await get('/api/vencimientos')
    return todos.filter((v) => {
      if (v.ID_estado_vencimiento === 'PAGADO') return false
      const fecha = new Date(v.Fecha_Vencimiento)
      return fecha >= hoy && fecha <= en30
    })
  },
  create:       (data)       => post('/api/vencimientos', data),
  update:       (id, data)   => patch(`/api/vencimientos/${id}`, data),
  marcarPagado: (id, fecha)  => post(`/api/vencimientos/${id}/pagar`, { Fecha_Pago_Real: fecha }),
  delete:       (id)         => del(`/api/vencimientos/${id}`),
}

// ============================================================
// IVA COMPRAS
// ============================================================
export const ivaCompras = {
  getAll:  ()           => get('/api/iva/compras'),
  create:  (data)       => post('/api/iva/compras', data),
  update:  (id, data)   => {
    // El backend no tiene PATCH para IVA — borramos y recreamos
    // Esto es una limitación temporal hasta agregar el endpoint PATCH
    console.warn('ivaCompras.update: endpoint PATCH no implementado aún, usar delete+create')
    return Promise.resolve(data)
  },
  delete:  (id)         => del(`/api/iva/compras/${id}`),
}

// ============================================================
// IVA VENTAS
// ============================================================
export const ivaVentas = {
  getAll:  ()           => get('/api/iva/ventas'),
  create:  (data)       => post('/api/iva/ventas', data),
  update:  (id, data)   => {
    console.warn('ivaVentas.update: endpoint PATCH no implementado aún, usar delete+create')
    return Promise.resolve(data)
  },
  delete:  (id)         => del(`/api/iva/ventas/${id}`),
}

// ============================================================
// DASHBOARD
// ============================================================
export const dashboard = {
  // En Electron devolvía { totalCobros, pendientes, vigentes }
  // En FastAPI devuelve { cobros_mes_actual, periodos_pendientes, contratos_vigentes, ... }
  // Adaptamos para mantener la misma forma que usa Dashboard.jsx
  getMetrics: async () => {
    const data = await get('/api/dashboard')
    return {
      totalCobros: data.cobros_mes_actual,
      pendientes:  data.periodos_pendientes,
      vigentes:    data.contratos_vigentes,
    }
  },
}
