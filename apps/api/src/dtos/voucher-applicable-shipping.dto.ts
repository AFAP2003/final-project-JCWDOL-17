import { z } from 'zod';

export const VoucherApplicableShippingDTO = z.object({
  subtotalShoppingPrice: z.number(),
  subtotalShoppingDiscountPrice: z.number(),
});
