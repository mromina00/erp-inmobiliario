import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = resolve(__dirname, '../dev.db')

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.tipos_unidad.createMany({
    data: [
      { ID_tipo: 'DEPARTAMENTO', Descripcion: 'Departamento' },
      { ID_tipo: 'LOCAL', Descripcion: 'Local' },
      { ID_tipo: 'CASA', Descripcion: 'Casa' },
      { ID_tipo: 'PROPIEDAD_EXTERNA', Descripcion: 'Propiedad externa' },
      { ID_tipo: 'LOTE', Descripcion: 'Lote' },
    ],
  })

  await prisma.perfiles_cobro.createMany({
    data: [
      { ID_perfil: 'ESTANDAR', Descripcion: 'Estándar' },
      { ID_perfil: 'COMERCIAL', Descripcion: 'Comercial' },
      { ID_perfil: 'EGRESO', Descripcion: 'Egreso' },
    ],
  })

  await prisma.estados_unidad.createMany({
    data: [
      { ID_estado_unidad: 'OCUPADA', Descripcion: 'Ocupada' },
      { ID_estado_unidad: 'LIBRE', Descripcion: 'Libre' },
      { ID_estado_unidad: 'NO_DISPONIBLE', Descripcion: 'No disponible' },
      { ID_estado_unidad: 'USO_PROPIO', Descripcion: 'Uso propio' },
    ],
  })

  console.log('Catálogos de unidades cargados correctamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })