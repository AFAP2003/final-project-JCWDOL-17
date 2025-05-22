import { getSessionServer } from '@/lib/auth/server';
import Content from './content';

export default async function CheckVerifiedPage() {
  const { data: session, error } = await getSessionServer();
  return (
    <div>
      <Content session={session} error={error} />
    </div>
  );
}
