import { z } from 'zod';

export const StoreChangeStatusDTO = z.object({
  storeId: z.string().uuid(),
  status: z.boolean(),
});
