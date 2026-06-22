import { ipcMain } from 'electron'
import prisma from './db.js'

function toPlain(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (value && typeof value === 'object' && typeof value.toFixed === 'function') {
      return Number(value)
    }
    return value
  }))
}

function generarPeriodos(contrato) {
  const periodos = []
  const inicio = new Date(contrato.Fecha_Inicio)
  const fin = new Date(contrato.Fecha_Vencimiento)
  let cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
  let numeroCuota = 1

  while (cursor <= fin) {
    const mesAno = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
    periodos.push({
      ID_periodo_contrato: `PC-${contrato.ID_contrato}-${numeroCuota}`,
      ID_contrato: contrato.ID_contrato,
      Numero_Cuota: numeroCuota,
      Mes_Ano: mesAno,
      Monto_Alquiler: contrato.Monto_Alquiler_Inicial,
      Monto_Expensas: contrato.Monto_Expensas_Inicial || 0,
      Monto_Cochera: contrato.Monto_Cochera_Inicial || 0,
      Monto_Municipalidad: 0,
      Monto_Otros: 0,
      Porcentaje_Recargo: 0,
      Monto_Recargo: 0,
      ID_estado_periodo: 'PENDIENTE',
    })
    numeroCuota++
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
  }

  return periodos
}

export function registerHandlers() {
  // ============================================================
  // PERSONAS
  // ============================================================
  ipcMain.handle('personas:getAll', async () => {
    const data = await prisma.personas.findMany({
      include: {
        tipo_doc: true,
        tipo_persona: true,
        rol_persona: true,
        estado_persona: true,
      },
      orderBy: { Nombre: 'asc' },
    })
    return toPlain(data)
  })

  ipcMain.handle('personas:create', async (event, data) => {
    return toPlain(await prisma.personas.create({ data }))
  })

  ipcMain.handle('personas:update', async (event, { id, data }) => {
    return toPlain(await prisma.personas.update({ where: { ID_persona: id }, data }))
  })

  ipcMain.handle('personas:delete', async (event, id) => {
    return toPlain(await prisma.personas.delete({ where: { ID_persona: id } }))
  })

  // ============================================================
  // EDIFICIOS
  // ============================================================
  ipcMain.handle('edificios:getAll', async () => {
    return toPlain(await prisma.edificios.findMany({ orderBy: { Nombre: 'asc' } }))
  })

  ipcMain.handle('edificios:create', async (event, data) => {
    return toPlain(await prisma.edificios.create({ data }))
  })

  ipcMain.handle('edificios:update', async (event, { id, data }) => {
    return toPlain(await prisma.edificios.update({ where: { ID_edificio: id }, data }))
  })

  ipcMain.handle('edificios:delete', async (event, id) => {
    return toPlain(await prisma.edificios.delete({ where: { ID_edificio: id } }))
  })

  // ============================================================
  // UNIDADES
  // ============================================================
  ipcMain.handle('unidades:getAll', async () => {
    const data = await prisma.unidades.findMany({
      include: {
        tipo: true,
        perfil: true,
        edificio: true,
        estado: true,
        contratos: {
          where: { ID_estado_contrato: 'VIGENTE' },
          include: { inquilino: true },
        },
      },
      orderBy: { Nombre_Unidad: 'asc' },
    })
    return toPlain(data)
  })

  ipcMain.handle('unidades:create', async (event, data) => {
    return toPlain(await prisma.unidades.create({ data }))
  })

  ipcMain.handle('unidades:update', async (event, { id, data }) => {
    return toPlain(await prisma.unidades.update({ where: { ID_unidad: id }, data }))
  })

  ipcMain.handle('unidades:delete', async (event, id) => {
    return toPlain(await prisma.unidades.delete({ where: { ID_unidad: id } }))
  })

  // ============================================================
  // CONTRATOS
  // ============================================================
  ipcMain.handle('contratos:getAll', async () => {
    const data = await prisma.contratos.findMany({
      include: {
        unidad: { include: { edificio: true } },
        inquilino: true,
        firmante: true,
        tipo_indice: true,
        periodicidad: true,
        estado_contrato: true,
        garantes: { include: { garante: true } },
      },
      orderBy: { Fecha_Inicio: 'desc' },
    })
    return toPlain(data)
  })

  ipcMain.handle('contratos:getById', async (event, id) => {
    const data = await prisma.contratos.findUnique({
      where: { ID_contrato: id },
      include: {
        unidad: { include: { edificio: true } },
        inquilino: true,
        firmante: true,
        tipo_indice: true,
        periodicidad: true,
        estado_contrato: true,
        garantes: { include: { garante: true } },
        periodos_contrato: { orderBy: { Numero_Cuota: 'asc' } },
      },
    })
    return toPlain(data)
  })

  ipcMain.handle('contratos:create', async (event, { data, garantesIds }) => {
    const contrato = await prisma.contratos.create({
      data: {
        ...data,
        garantes: garantesIds && garantesIds.length > 0
          ? {
              create: garantesIds.map((personaId) => ({
                ID_garante_contrato: 'GC-' + Date.now() + '-' + personaId,
                ID_persona_garante: personaId,
              })),
            }
          : undefined,
      },
    })

    // Generar automáticamente los períodos mensuales del contrato
    const periodos = generarPeriodos(contrato)
    if (periodos.length > 0) {
      await prisma.periodos_contrato.createMany({ data: periodos })
    }

    return toPlain(contrato)
  })

  ipcMain.handle('contratos:update', async (event, { id, data, garantesIds }) => {
    await prisma.garantes_contrato.deleteMany({ where: { ID_contrato: id } })

    const contrato = await prisma.contratos.update({
      where: { ID_contrato: id },
      data: {
        ...data,
        garantes: garantesIds && garantesIds.length > 0
          ? {
              create: garantesIds.map((personaId) => ({
                ID_garante_contrato: 'GC-' + Date.now() + '-' + personaId,
                ID_persona_garante: personaId,
              })),
            }
          : undefined,
      },
    })

    return toPlain(contrato)
  })

  ipcMain.handle('contratos:delete', async (event, id) => {
    await prisma.garantes_contrato.deleteMany({ where: { ID_contrato: id } })
    await prisma.periodos_contrato.deleteMany({ where: { ID_contrato: id } })
    return toPlain(await prisma.contratos.delete({ where: { ID_contrato: id } }))
  })

  // ============================================================
  // PERIODOS DE CONTRATO
  // ============================================================
  ipcMain.handle('periodos:getByContrato', async (event, contratoId) => {
    const data = await prisma.periodos_contrato.findMany({
      where: { ID_contrato: contratoId },
      include: { estado_periodo: true, cobros_alquiler: true },
      orderBy: { Numero_Cuota: 'asc' },
    })
    return toPlain(data)
  })

  ipcMain.handle('periodos:update', async (event, { id, data }) => {
    return toPlain(await prisma.periodos_contrato.update({
      where: { ID_periodo_contrato: id },
      data,
    }))
  })

  // ============================================================
  // CUENTAS
  // ============================================================
  ipcMain.handle('cuentas:getAll', async () => {
    const data = await prisma.cuentas.findMany({
      include: { tipo_cuenta: true, moneda: true, titular: true },
      orderBy: { Nombre_Cuenta: 'asc' },
    })
    return toPlain(data)
  })

  ipcMain.handle('cuentas:create', async (event, data) => {
    return toPlain(await prisma.cuentas.create({ data }))
  })

  ipcMain.handle('cuentas:update', async (event, { id, data }) => {
    return toPlain(await prisma.cuentas.update({ where: { ID_cuenta: id }, data }))
  })

  ipcMain.handle('cuentas:delete', async (event, id) => {
    return toPlain(await prisma.cuentas.delete({ where: { ID_cuenta: id } }))
  })

// ============================================================
  // LIBRO DIARIO
  // ============================================================
  ipcMain.handle('libroDiario:getAll', async () => {
    const data = await prisma.libro_diario.findMany({
      include: {
        cuenta: true,
        persona_entidad: true,
        unidad: true,
        medio_pago: true,
        subcategoria: true,
      },
      orderBy: { Fecha: 'desc' },
    })
    return toPlain(data)
  })

  // ============================================================
  // COBROS DE ALQUILER
  // ============================================================
ipcMain.handle('cobros:create', async (event, { medioPago, personaId, unidadId, ...data }) => {
    const cobro = await prisma.cobros_alquiler.create({ data })

    if (data.ID_periodo_contrato) {
      await prisma.periodos_contrato.update({
        where: { ID_periodo_contrato: data.ID_periodo_contrato },
        data: { ID_estado_periodo: 'PAGADO' },
      })
    }

    // Generar movimiento en el libro diario automáticamente
    await prisma.libro_diario.create({
      data: {
        ID_movimiento: 'LD-' + Date.now(),
        Fecha: data.Fecha_Pago,
        ID_cuenta: data.ID_cuenta_destino,
        ID_persona_entidad: personaId,
        ID_unidad: unidadId || null,
        Detalle: `Cobro de alquiler - ${data.ID_cobro}`,
        Monto: data.Monto_Pagado,
        ID_medio_pago: medioPago,
        ID_subcategoria_flujo: data.Imputacion_Pago === 'ALQUILER' ? 'ALQUILER' : 'OTROS_INGRESOS',
        Modulo_Origen: 'ALQUILERES',
        ID_referencia_origen: cobro.ID_cobro,
        Conciliado: false,
      },
    })

    return toPlain(cobro)
  })

  ipcMain.handle('cobros:delete', async (event, { id, periodoId }) => {
    await prisma.cobros_alquiler.delete({ where: { ID_cobro: id } })
    if (periodoId) {
      await prisma.periodos_contrato.update({
        where: { ID_periodo_contrato: periodoId },
        data: { ID_estado_periodo: 'PENDIENTE' },
      })
    }
    return { ok: true }
  })

  // ============================================================
  // DASHBOARD
  // ============================================================
  ipcMain.handle('dashboard:getMetrics', async () => {
    const now = new Date()
    const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const mesSiguiente = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`

    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)
    const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const [cobros, pendientes, vigentes] = await Promise.all([
      prisma.cobros_alquiler.findMany({
        where: {
          Fecha_Pago: { gte: inicioMes.toISOString(), lte: finMes.toISOString() },
        },
      }),
      prisma.periodos_contrato.count({
        where: {
          ID_estado_periodo: 'PENDIENTE',
          Mes_Ano: { in: [mesActual, mesSiguiente] },
        },
      }),
      prisma.contratos.count({
        where: { ID_estado_contrato: 'VIGENTE' },
      }),
    ])

    const totalCobros = cobros.reduce((acc, c) => acc + Number(c.Monto_Pagado), 0)

    return toPlain({ totalCobros, pendientes, vigentes })
  })

  // ============================================================
  // CATÁLOGOS
  // ============================================================
  ipcMain.handle('catalogos:tiposDocumento', async () => toPlain(await prisma.tipos_documento.findMany()))
  ipcMain.handle('catalogos:tiposPersona', async () => toPlain(await prisma.tipos_persona.findMany()))
  ipcMain.handle('catalogos:rolesPersona', async () => toPlain(await prisma.roles_persona.findMany()))
  ipcMain.handle('catalogos:estadosPersona', async () => toPlain(await prisma.estados_persona.findMany()))
  ipcMain.handle('catalogos:tiposUnidad', async () => toPlain(await prisma.tipos_unidad.findMany()))
  ipcMain.handle('catalogos:perfilesCobro', async () => toPlain(await prisma.perfiles_cobro.findMany()))
  ipcMain.handle('catalogos:estadosUnidad', async () => toPlain(await prisma.estados_unidad.findMany()))
  ipcMain.handle('catalogos:estadosContrato', async () => toPlain(await prisma.estados_contrato.findMany()))
  ipcMain.handle('catalogos:tiposIndice', async () => toPlain(await prisma.tipos_indice.findMany()))
  ipcMain.handle('catalogos:periodicidades', async () => toPlain(await prisma.periodicidades.findMany()))
  ipcMain.handle('catalogos:imputaciones', async () => toPlain(await prisma.imputaciones.findMany()))
  ipcMain.handle('catalogos:tiposCuenta', async () => toPlain(await prisma.tipos_cuenta.findMany()))
  ipcMain.handle('catalogos:monedas', async () => toPlain(await prisma.monedas.findMany()))
  ipcMain.handle('catalogos:mediosPago', async () => toPlain(await prisma.medios_pago.findMany()))
}