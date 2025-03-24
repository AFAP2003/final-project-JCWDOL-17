import { createAuthClientServer } from '@/lib/auth/server';
import { UserSession } from '@/types/user-session';

export async function getSession() {
  const supabase = await createAuthClientServer();
  const { data, error } = await supabase.auth.getSession();
  if (!data.session) return null;

  return {
    accessToken: data.session!.access_token,
    user: data.session!.user.user_metadata as UserSession,
  };
}
