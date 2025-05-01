import { z } from 'zod';

export const UpdateCartItemDTO = z.object({
  cartItemId: z.string().uuid('Invalid cart item ID format'),
  quantity: z
    .number()
    .int()
    .min(0, 'Quantity must be zero or a positive integer'),
  storeId: z.string().uuid('Invalid store ID format'),
});
