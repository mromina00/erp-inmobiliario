import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = resolve(__dirname, '../dev.db')

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.estados_contrato.createMany({
    data: [
      { ID_estado_contrato: 'VIGENTE', Descripcion: 'Vigente' },
      { ID_estado_contrato: 'FINALIZADO', Descripcion: 'Finalizado' },
      { ID_estado_contrato: 'RENOVADO', Descripcion: 'Renovado' },
    ],
  })

  await prisma.tipos_indice.createMany({
    data: [
      { ID_indice: 'ICL', Descripcion: 'ICL' },
      { ID_indice: 'IPC', Descripcion: 'IPC' },
      { ID_indice: 'SIN_INDEXACION', Descripcion: 'Sin indexación' },
    ],
  })

  await prisma.periodicidades.createMany({
    data: [
      { ID_periodicidad: 'CUATRIMESTRAL', Descripcion: 'Cuatrimestral' },
      { ID_periodicidad: 'SEMESTRAL', Descripcion: 'Semestral' },
    ],
  })

  console.log('Catálogos de contratos cargados correctamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })