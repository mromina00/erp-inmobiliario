import { ipcMain } from 'electron'
import prisma from './db.js'

export function registerHandlers() {
  // PERSONAS
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

  // CATÁLOGOS (para selects del formulario de personas)
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
}