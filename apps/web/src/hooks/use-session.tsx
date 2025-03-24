/* eslint-disable react-hooks/exhaustive-deps */
import { createAuthClientBrowser } from '@/lib/auth/client';
import { UserSession } from '@/types/user-session';
import { useEffect, useState } from 'react';

export function useSession() {
  const supabase = createAuthClientBrowser();
  const [isPending, setIsPending] = useState<boolean>(true);
  const [session, setSession] = useState<{
    accessToken: string;
    user: UserSession;
  } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsPending(false);
      if (session) {
        setSession({
          accessToken: session.access_token,
          user: session.user.user_metadata as UserSession,
        });
      } else {
        setSession(null);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsPending(false);
      if (session) {
        setSession({
          accessToken: session.access_token,
          user: session.user.user_metadata as UserSession,
        });
      } else {
        setSession(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return { isPending, session };
}
