import { prismaclient } from '@/prisma';
import { VoucherType } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { currentDate } from './datetime';

export const genVoucherCode = async (type: VoucherType) => {
  for (let attempt = 0; attempt < 10; attempt++) {
    let prefix = '';
    switch (type) {
      case 'REFERRAL':
        prefix = 'VREF-';
        break;
      case 'SHIPPING':
        prefix = 'ONGK-';
        break;
      case 'PRODUCT_SPECIFIC':
        prefix = 'PROD-';
        break;
    }
    const suffix = `-${currentDate().getFullYear()}`;
    const middle = uuid().replace(/-/g, '').substring(0, 10).toUpperCase();
    const code = `${prefix}${middle}${suffix}`;

    const exist = await prismaclient.voucher.findUnique({
      where: {
        code: code,
      },
    });

    if (!exist) {
      return code;
    }
  }
  throw new Error('Failed to generate a unique voucher code.');
};
