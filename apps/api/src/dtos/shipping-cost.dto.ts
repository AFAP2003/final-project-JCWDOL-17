import { z } from 'zod';

export const ShippingCostDTO = z.object({
  origin: z.object({
    id: z.string(),
    type: z.enum(['postal_code', 'district']),
  }),
  destination: z.object({
    id: z.string(),
    type: z.enum(['postal_code', 'district']),
  }),
  weight: z
    .number()
    .int()
    .describe('The weight of the package in grams (e.g., 1000 for 1kg).'),
  courier: z
    .string()
    .describe('Colon-separated courier codes (e.g., jne:sicepat:jnt).'),
});
