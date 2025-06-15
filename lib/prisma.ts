import { PrismaClient } from '../src/generated/prisma'

declare global {
  var prisma: PrismaClient | undefined
}

if (!global.prisma) {
  global.prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })
}

export const prisma = global.prisma 