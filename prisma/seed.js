import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = resolve(__dirname, '../dev.db')

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.tipo_comprobante.createMany({
    data: [
      { ID_tipo_comprobante: 'FACTURA_A', Descripcion: 'Factura A' },
      { ID_tipo_comprobante: 'FACTURA_B', Descripcion: 'Factura B' },
      { ID_tipo_comprobante: 'FACTURA_C', Descripcion: 'Factura C' },
    ],
  })

  console.log('Catálogos de IVA cargados correctamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })