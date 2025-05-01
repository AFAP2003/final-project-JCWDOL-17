import { PaymentMethod } from '@prisma/client';
import { z } from 'zod';

export const CreateOrderDTO = z.object({
  addressId: z.string().uuid('Invalid address ID format'),
  shippingMethodId: z.string().uuid('Invalid shipping method ID format'),
  paymentMethod: z.enum([
    PaymentMethod.BANK_TRANSFER,
    PaymentMethod.PAYMENT_GATEWAY,
  ]),
  vouchers: z.array(z.string().uuid('Invalid voucher ID format')).optional(),
  notes: z.string().optional(),
});
