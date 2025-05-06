import { PrismaClient } from '@prisma/client';
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prismaclient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production')
  globalForPrisma.prisma = prismaclient;
