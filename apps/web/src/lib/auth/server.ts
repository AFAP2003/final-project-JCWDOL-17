import { cookies } from 'next/headers';
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

  return session;
}
