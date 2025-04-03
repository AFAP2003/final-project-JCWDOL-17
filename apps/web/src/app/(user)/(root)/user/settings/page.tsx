import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContentHeader from '../content-header';
import TabContentBiodata from './tab-content-biodata';
import TabContentSecurity from './tab-content-security';

export default function SettingsPage() {
  return (
    <div className="p-2 w-full min-h-[720px]">
      <ContentHeader>Settings</ContentHeader>
      <Separator />
      <div className="pt-4">
        <Tabs defaultValue="biodata" className="">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="biodata">Biodata</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabContentBiodata />
          <TabContentSecurity />
        </Tabs>
      </div>
    </div>
  );
}
