'use client';

import { useSession } from '@/lib/auth/client';

export default function ExamplePrivatePageClient() {
  const { data, error, isPending } = useSession();
  if (error) throw error;

  if (isPending) return <div>Loading session...</div>;
  if (!data) return <div>Not Log in</div>;
  return (
    <div>
      <p>access token: {data.session.token}</p>
      <p>user: {JSON.stringify(data.user)}</p>
    </div>
  );
}
