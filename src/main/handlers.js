import { ipcMain } from 'electron'
import prisma from './db.js'

export function registerHandlers() {
  // Traer todas las personas
  ipcMain.handle('personas:getAll', async () => {
    return await prisma.personas.findMany({
      include: {
        tipo_persona: true,
        rol_persona: true,
        estado_persona: true,
      },
    })
  })

  // Crear una persona nueva
  ipcMain.handle('personas:create', async (event, data) => {
    return await prisma.personas.create({ data })
  })
}