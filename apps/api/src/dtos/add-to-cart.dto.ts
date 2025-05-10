import { z } from 'zod';

export const AddToCartDTO = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});
