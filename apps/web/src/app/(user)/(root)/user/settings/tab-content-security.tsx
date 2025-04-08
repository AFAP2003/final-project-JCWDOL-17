'use client';

import ErrorContent from '@/components/error-content';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { apiclient } from '@/lib/apiclient';
// import { useSession } from '@/lib/auth/client';
import { GetAllSessionResponse } from '@/lib/types/get-all-session-response';
import { useQuery } from '@tanstack/react-query';
// import { notFound } from 'next/navigation';

type Props = {};

export default function TabContentSecurity({}: Props) {
  // const { data: currentSession, isPending } = useSession();
  const {
    data: allsessions,
    error,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ['user/settings', 'tab-content-security'],
    queryFn: async () => {
      const { data } = await apiclient.get('/auth/sessions');
      return data as GetAllSessionResponse;
    },
  });

  // if (!currentSession) notFound();

  if (error || !allsessions || allsessions?.length < 1) {
    return (
      <TabsContent value="security">
        <Card className="flex gap-12 p-6">
          <ErrorContent
            showCta={true}
            ctaAction={refetch}
            ctaLabel="Try Again"
            description="We encountered some issue, please try again!"
          />
        </Card>
      </TabsContent>
    );
  }

  // const currentSession = sessions?.find((session) => session.isCurrent);
  // const otherSessions = sessions?.filter(
  //   (session) => session.isCurrent !== true,
  // );

  return (
    <TabsContent value="security">
      <Card className="flex gap-12 p-6">
        <div>Security</div>
      </Card>
    </TabsContent>
  );
}
