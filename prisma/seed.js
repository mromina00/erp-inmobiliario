import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = resolve(__dirname, '../dev.db')

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.marcas_tarjeta.createMany({
    data: [
      { ID_marca: 'VISA', Descripcion: 'Visa' },
      { ID_marca: 'MASTERCARD', Descripcion: 'Mastercard' },
      { ID_marca: 'AMEX', Descripcion: 'American Express' },
      { ID_marca: 'NARANJA', Descripcion: 'Naranja' },
      { ID_marca: 'CABAL', Descripcion: 'Cabal' },
    ],
  })

  await prisma.estados_resumen.createMany({
    data: [
      { ID_estado_resumen: 'PENDIENTE', Descripcion: 'Pendiente' },
      { ID_estado_resumen: 'PAGADO', Descripcion: 'Pagado' },
      { ID_estado_resumen: 'VENCIDO', Descripcion: 'Vencido' },
    ],
  })

  console.log('Catálogos de tarjetas cargados correctamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })