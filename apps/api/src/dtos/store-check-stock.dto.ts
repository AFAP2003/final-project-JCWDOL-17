import { z } from 'zod';

export const StoreCheckStockDTO = z.object({
  storeId: z.string().trim().uuid(),
  products: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().positive(),
      }),
    )
    .nonempty(),
});
