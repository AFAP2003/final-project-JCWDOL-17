import { z } from 'zod';

export const VoucherApplicableShoppingDTO = z.object({
  cartItems: z
    .array(
      z.object({
        id: z.string().uuid(),
        productId: z.string().uuid(),
        discountPrice: z.number(),
        subtotalPrice: z.number(),
      }),
    )
    .nonempty(),
  subtotalShoppingPrice: z.number(),
  subtotalShoppingDiscountPrice: z.number(),
});
