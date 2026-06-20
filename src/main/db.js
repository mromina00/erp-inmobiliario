import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = resolve(__dirname, '../../dev.db')

console.log('Conectando a base de datos en:', dbPath)

const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`,
})

const prisma = new PrismaClient({ adapter })

export default prisma