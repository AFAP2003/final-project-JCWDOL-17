import { z } from 'zod';

export const ResendConfirmEmailDTO = z.object({
  email: z.string().email('Invalid email format'),
});
