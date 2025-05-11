import { z } from 'zod';

export const CalculateShippingDTO = z.object({
  addressId: z.string().uuid(),
  shippingMethodId: z.string().uuid(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
    }),
  ),
});
