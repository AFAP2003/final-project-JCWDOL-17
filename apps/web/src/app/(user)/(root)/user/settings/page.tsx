'use client';

import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { MapPin, Shield, User } from 'lucide-react';
import { useState } from 'react';
import ContentHeader from '../_components/content-header';
import TabContentAddress from './_components/tab-content-address';
import TabContentBiodata from './_components/tab-content-biodata';
import TabContentSecurity from './_components/tab-content-security';

export default function SettingsPage() {
  const tabs = [
    { name: 'Biodata', icon: User },
    { name: 'Address', icon: MapPin },
    { name: 'Security', icon: Shield },
  ];

  const [activeTab, setActiveTab] = useState('biodata');

  return (
    <div className="w-full">
      <ContentHeader>Settings</ContentHeader>

      <Separator className="my-6 bg-neutral-800" />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-neutral-100 py-6 px-3 my-3">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const active = activeTab === tab.name.toLowerCase();

            return (
              <TabsTrigger
                className={cn(
                  'text-base hover:text-neutral-600 text-neutral-600 w-full',
                  'data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-200',
                )}
                key={idx}
                value={tab.name.toLowerCase()}
              >
                <div className="flex items-center justify-center gap-2 max-sm:text-sm">
                  <Icon className="w-4 h-4 max-sm:hidden" />
                  <span>{tab.name}</span>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent
          value="biodata"
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <TabContentBiodata />
        </TabsContent>

        <TabsContent
          value="address"
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <TabContentAddress />
        </TabsContent>

        <TabsContent
          value="security"
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <TabContentSecurity />
        </TabsContent>
      </Tabs>
    </div>
  );
}
