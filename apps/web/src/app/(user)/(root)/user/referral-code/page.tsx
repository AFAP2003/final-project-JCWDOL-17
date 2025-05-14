import { Separator } from '@/components/ui/separator';
import ContentHeader from '../_components/content-header';
import Content from './content';

export default function ReferralCodePage() {
  return (
    <div className="flex flex-col w-full h-full">
      <ContentHeader>Kode Referral</ContentHeader>

      <Separator className="my-6 mb-9 bg-neutral-800" />

      <Content />
    </div>
  );
}
