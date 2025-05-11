import { z } from 'zod';

export const ProductGetByIdDTO = z.object({
  productId: z.string().uuid('Invalid product ID format'),
});
