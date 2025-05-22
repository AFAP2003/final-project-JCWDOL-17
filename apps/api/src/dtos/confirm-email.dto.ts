import { z } from 'zod';

export const ConfirmEmailDTO = z.object({
  token: z
    .string()
    .length(25) // Must be exactly 25 characters
    .regex(/^[a-f0-9]+$/i), // Must contain only hexadecimal characters
});
