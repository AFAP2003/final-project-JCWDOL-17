import { z } from 'zod';

export const RevokeSessionDTO = z.object({
  sessionToken: z.string(),
});
