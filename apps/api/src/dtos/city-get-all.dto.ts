import { z } from 'zod';

export const CityGetAllDTO = z.object({
  name: z.string().trim().optional(),
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
