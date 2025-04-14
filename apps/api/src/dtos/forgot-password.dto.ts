import { z } from 'zod';

export const ForgotPasswordDTO = z.object({
  email: z.string().email('Invalid email format'),
});
