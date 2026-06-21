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

export function registerHandlers() {
  // ============================================================
  // PERSONAS
  // ============================================================
  ipcMain.handle('personas:getAll', async () => {
    return await prisma.personas.findMany({
      include: {
        tipo_doc: true,
        tipo_persona: true,
        rol_persona: true,
        estado_persona: true,
      },
      orderBy: { Nombre: 'asc' },
    })
  })

  ipcMain.handle('personas:create', async (event, data) => {
    return await prisma.personas.create({ data })
  })

  ipcMain.handle('personas:update', async (event, { id, data }) => {
    return await prisma.personas.update({
      where: { ID_persona: id },
      data,
    })
  })

  ipcMain.handle('personas:delete', async (event, id) => {
    return await prisma.personas.delete({ where: { ID_persona: id } })
  })

  // ============================================================
  // EDIFICIOS
  // ============================================================
  ipcMain.handle('edificios:getAll', async () => {
    return await prisma.edificios.findMany({ orderBy: { Nombre: 'asc' } })
  })

  ipcMain.handle('edificios:create', async (event, data) => {
    return await prisma.edificios.create({ data })
  })

  ipcMain.handle('edificios:update', async (event, { id, data }) => {
    return await prisma.edificios.update({ where: { ID_edificio: id }, data })
  })

  ipcMain.handle('edificios:delete', async (event, id) => {
    return await prisma.edificios.delete({ where: { ID_edificio: id } })
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
    return await prisma.unidades.create({ data })
  })

  ipcMain.handle('unidades:update', async (event, { id, data }) => {
    return await prisma.unidades.update({ where: { ID_unidad: id }, data })
  })

  ipcMain.handle('unidades:delete', async (event, id) => {
    return await prisma.unidades.delete({ where: { ID_unidad: id } })
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
    return await prisma.contratos.create({
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
  })

  ipcMain.handle('contratos:update', async (event, { id, data, garantesIds }) => {
    // Reemplazamos los garantes existentes por la nueva lista
    await prisma.garantes_contrato.deleteMany({ where: { ID_contrato: id } })

    return await prisma.contratos.update({
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
  })

  ipcMain.handle('contratos:delete', async (event, id) => {
    await prisma.garantes_contrato.deleteMany({ where: { ID_contrato: id } })
    return await prisma.contratos.delete({ where: { ID_contrato: id } })
  })

  // ============================================================
  // CATÁLOGOS
  // ============================================================
  ipcMain.handle('catalogos:tiposDocumento', async () => {
    return await prisma.tipos_documento.findMany()
  })

  ipcMain.handle('catalogos:tiposPersona', async () => {
    return await prisma.tipos_persona.findMany()
  })

  ipcMain.handle('catalogos:rolesPersona', async () => {
    return await prisma.roles_persona.findMany()
  })

  ipcMain.handle('catalogos:estadosPersona', async () => {
    return await prisma.estados_persona.findMany()
  })

  ipcMain.handle('catalogos:tiposUnidad', async () => {
    return await prisma.tipos_unidad.findMany()
  })

  ipcMain.handle('catalogos:perfilesCobro', async () => {
    return await prisma.perfiles_cobro.findMany()
  })

  ipcMain.handle('catalogos:estadosUnidad', async () => {
    return await prisma.estados_unidad.findMany()
  })

  ipcMain.handle('catalogos:estadosContrato', async () => {
    return await prisma.estados_contrato.findMany()
  })

  ipcMain.handle('catalogos:tiposIndice', async () => {
    return await prisma.tipos_indice.findMany()
  })

  ipcMain.handle('catalogos:periodicidades', async () => {
    return await prisma.periodicidades.findMany()
  })
}