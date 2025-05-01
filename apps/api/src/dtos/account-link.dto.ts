import { z } from 'zod';

export const AccountLinkDTO = z.union([
  z.object({
    method: z.literal('CREDENTIAL'),
    action: z.enum(['CREATE', 'RESET']),
  }),
  z.object({
    method: z.literal('GOOGLE'),
    callbackUrl: z.string().url(),
  }),
]);
