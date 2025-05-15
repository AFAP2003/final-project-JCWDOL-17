import { z } from 'zod';

export const VoucherCheckDTO = z.object({
  code: z.string().min(1, 'Voucher code is required'),
  subtotal: z.number().positive('Subtotal must be positive'),
});
