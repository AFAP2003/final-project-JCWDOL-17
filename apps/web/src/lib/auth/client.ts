import { Session } from '@/lib/types/session';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/better/auth`,
  fetchOptions: {},
  plugins: [],
});

export const { signIn, signOut, signUp } = authClient;

export function useSession() {
  const { data, error, isPending, refetch } = authClient.useSession();
  return {
    data: data as unknown as Session | null,
    error,
    isPending,
    refetch,
  };
}
