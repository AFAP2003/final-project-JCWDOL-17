import { z } from 'zod';

export const ProductCategoryGetAllDTO = z.object({
  query: z.string().trim().optional(),
  orderBy: z
    .enum(['createdAt', 'count', '-createdAt', '-count'])
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
