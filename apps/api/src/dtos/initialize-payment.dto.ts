import { z } from 'zod';

export const InitializePaymentDTO = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
});
