import { ipcMain } from 'electron'
import prisma from './db.js'

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
    return await prisma.unidades.findMany({
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
}