import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = resolve(__dirname, '../dev.db')

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.tipos_documento.createMany({
    data: [
      { ID_tipo_doc: 'DNI', Descripcion: 'DNI' },
      { ID_tipo_doc: 'CUIT', Descripcion: 'CUIT' },
      { ID_tipo_doc: 'PASAPORTE', Descripcion: 'Pasaporte' },
    ],
  })

  await prisma.tipos_persona.createMany({
    data: [
      { ID_tipo_persona: 'FISICA', Descripcion: 'Física' },
      { ID_tipo_persona: 'JURIDICA', Descripcion: 'Jurídica' },
    ],
  })

  await prisma.roles_persona.createMany({
    data: [
      { ID_rol: 'INQUILINO', Descripcion: 'Inquilino' },
      { ID_rol: 'PROPIETARIO', Descripcion: 'Propietario' },
      { ID_rol: 'GARANTE', Descripcion: 'Garante' },
      { ID_rol: 'PROVEEDOR', Descripcion: 'Proveedor' },
      { ID_rol: 'FIRMANTE', Descripcion: 'Firmante' },
    ],
  })

  await prisma.estados_persona.createMany({
    data: [
      { ID_estado_persona: 'ACTIVO', Descripcion: 'Activo' },
      { ID_estado_persona: 'INACTIVO', Descripcion: 'Inactivo' },
    ],
  })

  console.log('Catálogos cargados correctamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })