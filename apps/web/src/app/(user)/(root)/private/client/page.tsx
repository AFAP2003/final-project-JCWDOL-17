'use client';

import { useSession } from '@/hooks/use-session';

export default function ExamplePrivatePageClient() {
  const { isPending, session } = useSession();

  if (isPending) return <div>Loading session...</div>;
  if (!session) return <div>Not Log in</div>;
  return (
    <div>
      <p>access token: {session.accessToken}</p>
      <p>user: {JSON.stringify(session.user)}</p>
    </div>
  );
}
