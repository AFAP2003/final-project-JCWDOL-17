import { createAuthMiddleware } from 'better-auth/api';

export type HookContext = Parameters<
  Parameters<typeof createAuthMiddleware>[0]
>[0];
