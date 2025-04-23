import { z } from 'zod';

export const AddressDeleteDTO = z.object({
  addressId: z.string().trim().uuid(),
});
