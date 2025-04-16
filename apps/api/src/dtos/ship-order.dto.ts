import { z } from 'zod';

export const ShipOrderDTO = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});
