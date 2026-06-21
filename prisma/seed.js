import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = resolve(__dirname, '../dev.db')

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.medios_pago.createMany({
    data: [
      { ID_medio: 'EFECTIVO', Descripcion: 'Efectivo' },
      { ID_medio: 'TRANSFERENCIA_DEBITO', Descripcion: 'Transferencia o Débito' },
    ],
  })

  await prisma.subcategorias_flujo.createMany({
    data: [
      { ID_subcat: 'ALQUILER', Tipo_Movimiento: 'INGRESO', Categoria_Padre: 'ALQUILERES', Descripcion: 'Alquiler' },
      { ID_subcat: 'EXPENSAS', Tipo_Movimiento: 'INGRESO', Categoria_Padre: 'ALQUILERES', Descripcion: 'Expensas' },
      { ID_subcat: 'OTROS_INGRESOS', Tipo_Movimiento: 'INGRESO', Categoria_Padre: 'GENERAL', Descripcion: 'Otros ingresos' },
    ],
  })

  console.log('Catálogos de libro diario cargados correctamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })