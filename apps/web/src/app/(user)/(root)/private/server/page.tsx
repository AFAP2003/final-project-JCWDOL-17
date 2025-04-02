import { getSessionServer } from '@/lib/auth/server';

export default async function ExamplePrivatePageServer() {
  const { data, error } = await getSessionServer();
  if (error) throw new Error(error.message);

  if (!data) return <div>Not Log in</div>;
  return (
    <div>
      <p>access token: {data.session.token}</p>
      <p>user: {JSON.stringify(data.user)}</p>
    </div>
  );
}
