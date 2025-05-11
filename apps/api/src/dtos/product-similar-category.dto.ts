import { z } from 'zod';

export const ProductSimilarCategoryDTO = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  orderBy: z
    .enum(['createdAt', '-createdAt', 'price', '-price'])
    .optional()
    .default('createdAt'),
  pageSize: z
    .string()
    .trim()
    .refine((arg) => !isNaN(Number(arg)), { message: 'Invalid number' }) // Ensure it's a valid number
    .transform((arg) => Number(arg))
    .pipe(z.number().min(1).max(100)) // Validate after transformation
    .optional()
    .default('10'),

  page: z
    .string()
    .trim()
    .refine((arg) => !isNaN(Number(arg)), { message: 'Invalid number' }) // Ensure it's a valid number
    .transform((arg) => Number(arg))
    .pipe(z.number().min(1).max(1000)) // Validate after transformation
    .optional()
    .default('1'),
});
