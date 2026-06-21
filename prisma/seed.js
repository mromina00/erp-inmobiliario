import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = resolve(__dirname, '../dev.db')

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.estados_periodo.createMany({
    data: [
      { ID_estado_periodo: 'PENDIENTE', Descripcion: 'Pendiente' },
      { ID_estado_periodo: 'PAGADO', Descripcion: 'Pagado' },
      { ID_estado_periodo: 'EN_MORA', Descripcion: 'En mora' },
    ],
  })

  await prisma.imputaciones.createMany({
    data: [
      { ID_imputacion: 'ALQUILER', Descripcion: 'Alquiler' },
      { ID_imputacion: 'SERVICIOS', Descripcion: 'Servicios' },
      { ID_imputacion: 'GENERAL', Descripcion: 'General' },
    ],
  })

  await prisma.tipos_cuenta.createMany({
    data: [
      { ID_tipo_cuenta: 'CAJA', Descripcion: 'Caja / Efectivo' },
      { ID_tipo_cuenta: 'BANCO', Descripcion: 'Cuenta bancaria' },
    ],
  })

  await prisma.monedas.createMany({
    data: [{ ID_moneda: 'ARS', Descripcion: 'Peso argentino', Simbolo: '$' }],
  })

  console.log('Catálogos de períodos/cobros cargados correctamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })