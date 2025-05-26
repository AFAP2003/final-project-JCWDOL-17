import { Separator } from '@/components/ui/separator';
import ContentHeader from '../_components/content-header';
import Content from './content';

type Props = {
  searchParams: {
    query?: string;
    type?: string;
    page?: string;
  };
};

export default function MyVoucherPage({ searchParams }: Props) {
  return (
    <div className="flex flex-col w-full h-full">
      <ContentHeader>Voucher Saya</ContentHeader>

      <Separator className="my-6 mb-9 bg-neutral-800" />

      <Content
        query={searchParams.query}
        type={searchParams.type}
        page={searchParams.page}
      />
    </div>
  );
}
