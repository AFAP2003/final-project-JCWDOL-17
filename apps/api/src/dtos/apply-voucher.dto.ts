import { z } from 'zod';

export const ApplyVoucherDTO = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  voucherCode: z.string().min(1, 'Voucher code is required'),
});
