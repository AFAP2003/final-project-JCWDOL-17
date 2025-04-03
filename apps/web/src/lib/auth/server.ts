import { cookies } from 'next/headers';
import { Session } from '../types/session';
import { authClient } from './client';

export async function getSessionServer() {
  const key = 'better-auth.session_token';
  const sessionCookie = cookies().get(key);

  const session = await authClient.getSession({
    fetchOptions: {
      onRequest: (ctx) => {
        ctx.headers.set(
          'cookie',
          `${sessionCookie?.name}=${decodeURIComponent(sessionCookie?.value || '')}`,
        );
        return ctx;
      },
    },
  });

  const { data, error } = session;
  return { data: data as unknown as Session | null, error: error };
}
