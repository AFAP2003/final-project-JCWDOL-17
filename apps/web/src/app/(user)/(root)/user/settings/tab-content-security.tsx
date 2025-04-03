'use client';

import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';

type Props = {};

export default function TabContentSecurity({}: Props) {
  return (
    <TabsContent value="security">
      <Card className="flex gap-12 p-6">
        <div>Security</div>
      </Card>
    </TabsContent>
  );
}
