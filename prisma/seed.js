import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = resolve(__dirname, '../dev.db')

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.tipos_servicio.createMany({
    data: [
      { ID_tipo_serv: 'LUZ', Descripcion: 'Luz' },
      { ID_tipo_serv: 'GAS', Descripcion: 'Gas' },
      { ID_tipo_serv: 'AGUA', Descripcion: 'Agua' },
      { ID_tipo_serv: 'MUNICIPALIDAD', Descripcion: 'Municipalidad' },
      { ID_tipo_serv: 'INTERNET', Descripcion: 'Internet' },
      { ID_tipo_serv: 'OTROS', Descripcion: 'Otros' },
    ],
  })

  await prisma.estados_boleta.createMany({
    data: [
      { ID_estado_boleta: 'PENDIENTE', Descripcion: 'Pendiente' },
      { ID_estado_boleta: 'PAGADA', Descripcion: 'Pagada' },
      { ID_estado_boleta: 'VENCIDA', Descripcion: 'Vencida' },
    ],
  })

  await prisma.responsables_pago.createMany({
    data: [
      { ID_responsable: 'INQUILINO', Descripcion: 'Inquilino' },
      { ID_responsable: 'PROPIETARIO', Descripcion: 'Propietario' },
    ],
  })

  console.log('Catálogos de servicios cargados correctamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })