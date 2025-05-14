'use client';

import { Card } from '@/components/ui/card';
import { useSession } from '@/lib/auth/client';
import LinkAccount from './link-account';
import LoginActivity from './login-activity';

type Props = {};

export default function TabContentSecurity({}: Props) {
  const { data: session } = useSession();

  return (
    <Card className="p-6">
      <div className="w-full min-h-[485px]">
        <LoginActivity current={session} />
        <LinkAccount session={session!} />
      </div>
    </Card>
  );
}
