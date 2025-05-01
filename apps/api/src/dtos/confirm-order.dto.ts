import { z } from 'zod';

export const ConfirmOrderDTO = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
});
