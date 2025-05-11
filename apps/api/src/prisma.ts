import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

Object.defineProperty(Decimal.prototype, 'toJSON', {
  value: function () {
    return this.toNumber();
  },
  configurable: true,
  writable: true,
});

// export default new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });
export const prismaclient = new PrismaClient({ log: ['warn', 'error'] });
