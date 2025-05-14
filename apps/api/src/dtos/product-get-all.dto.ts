import { z } from 'zod';

const ALLOWED_PROMO = ['no-rules', 'max-price', 'bogo'] as const;

export const ProductGetAllDTO = z.object({
  query: z.string().trim().optional(),
  orderBy: z
    .enum(['createdAt', '-createdAt', 'price', '-price'])
    .optional()
    .default('createdAt'),
  promo: z
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
        val.every((item) => ALLOWED_PROMO.includes(item as any)),
      {
        message:
          'Invalid promo value. Allowed values: no-rules, max-price, bogo',
      },
    )
    .transform((val) => {
      // Ensure final return is undefined or valid string array
      return val === undefined
        ? undefined
        : (val as (typeof ALLOWED_PROMO)[number][]);
    }),

  price: z
    .string()
    .trim()
    .optional()
    .transform((val) => {
      if (!val) return undefined;

      const parts = val
        .split(',')
        .map((s) => s.trim())
        .map(Number);

      return parts;
    })
    .refine(
      (val): val is [number, number] => {
        if (val === undefined) return true;
        return val.every((n) => typeof n === 'number' && !isNaN(n));
      },
      {
        message:
          'price range must be number or comma separated numbers like "100,500"',
      },
    )
    .transform((val) => {
      // enforce type [number, number] | undefined in output
      return val === undefined
        ? undefined
        : ([val[0], val[1]] as [number, number]);
    }),

  category: z
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
    .transform((val) => {
      return val === undefined ? undefined : (val as string[]);
    }),

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
