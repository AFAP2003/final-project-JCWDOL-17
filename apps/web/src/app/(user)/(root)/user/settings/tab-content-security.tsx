'use client';

import ErrorContent from '@/components/error-content';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { useActiveSession } from '@/hooks/use-active-session';
import { notFound } from 'next/navigation';
import LoginActivity from './login-activity';

type Props = {};

export default function TabContentSecurity({}: Props) {
  const { current, sessions, error, isPending, refetch } = useActiveSession();
  if (!isPending && !current) notFound();

  return (
    <TabsContent value="security">
      <Card className="flex gap-12 p-6">
        {error || !sessions || sessions.length < 1 ? (
          <ErrorContent
            showCta={true}
            ctaAction={refetch}
            ctaLabel="Try Again"
            description="We encountered some issue, please try again!"
          />
        ) : (
          <div>
            <LoginActivity current={current} sessions={sessions} />
          </div>
        )}
      </Card>
    </TabsContent>
  );
}
