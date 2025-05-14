import { z } from 'zod';

export const StoreGetByIdDTO = z.object({
  storeId: z.string().uuid(),
});
