// import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/better/auth`,
  fetchOptions: {},
});

export const { useSession, sendVerificationEmail, signIn, signOut, signUp } =
  authClient;
