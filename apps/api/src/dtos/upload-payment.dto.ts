import { z } from 'zod';

export const UploadPaymentDTO = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
  file: z.any().refine((file) => file, 'Payment proof is required'),
});
