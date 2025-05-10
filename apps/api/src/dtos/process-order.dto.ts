import { z } from 'zod';

export const ProcessOrderDTO = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
  verifyPayment: z.boolean().default(true),
  paymentProofId: z.string().uuid('Invalid payment proof ID format').optional(),
  notes: z.string().optional(),
});
