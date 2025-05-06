import { z } from 'zod';

export const UpdateCartItemDTO = z.object({
  itemId: z.string().uuid('Invalid cart item ID format'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});
