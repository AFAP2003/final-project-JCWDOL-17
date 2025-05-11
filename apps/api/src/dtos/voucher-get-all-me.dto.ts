import { z } from 'zod';

const ALLOWED_TYPE = ['refferal', 'product-specific', 'shipping'] as const;

export const VoucherGetAllMeDTO = z.object({
  query: z.string().trim().optional(),
  type: z
    .string()
    .trim()
    .optional()
    .transform((val) => {
      if (!val) return undefined;

      // Split by comma, trim each value, remove empty
      const items = val
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      return items;
    })
    .refine(
      (val) =>
        val === undefined ||
        val.every((item) => ALLOWED_TYPE.includes(item as any)),
      {
        message:
          'Invalid type value. Allowed values: refferal, product-specific, shipping',
      },
    )
    .transform((val) => {
      // Ensure final return is undefined or valid string array
      return val === undefined
        ? undefined
        : (val as (typeof ALLOWED_TYPE)[number][]);
    }),

  orderBy: z
    .enum([
      'createdAt',
      '-createdAt',
      'endDate',
      '-endDate',
      'startDate',
      '-startDate',
    ])
    .optional()
    .default('-createdAt'),

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
