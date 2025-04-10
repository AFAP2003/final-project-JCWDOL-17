'use client';

import ErrorContent from '@/components/error-content';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { useActiveSession } from '@/hooks/use-active-session';
import { redirect } from 'next/navigation';
import LinkAccount from './link-account';
import LoginActivity from './login-activity';

type Props = {};

export default function TabContentSecurity({}: Props) {
  const { current, sessions, error, isPending, refetch } = useActiveSession();
  if (isPending) return null;
  if (!isPending && !current) redirect('/auth/signin');

  return (
    <TabsContent value="security">
      <Card className="p-6">
        {error || !sessions || sessions.length < 1 ? (
          <ErrorContent
            showCta={true}
            ctaAction={refetch}
            ctaLabel="Try Again"
            description="We encountered some issue, please try again!"
          />
        ) : (
          <div className="w-full">
            <LoginActivity
              current={current}
              sessions={sessions}
              refetch={refetch}
            />
            <LinkAccount session={current!} />
          </div>
        )}
      </Card>
    </TabsContent>
  );
}
