import { getSession } from '@/actions/getSession';

export default async function ExamplePrivatePageServer() {
  const session = await getSession();

  if (!session) return <div>Not Log in</div>;
  return (
    <div>
      <p>access token: {session.accessToken}</p>
      <p>user: {JSON.stringify(session.user)}</p>
    </div>
  );
}
