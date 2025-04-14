import { auth } from '@/auth';

export type UserSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;
