import MaxWidthWrapper from '@/components/max-width-wrapper';
import { ReactNode } from 'react';
import UserSidebar from './_components/sidebar';

type Props = {
  children: ReactNode;
};

export default function UserLayout({ children }: Props) {
  return (
    <MaxWidthWrapper className="">
      <div className="grid grid-rows-1 grid-cols-1 w-full lg:grid-cols-[254px_1fr] gap-12">
        <UserSidebar />
        {children}
      </div>
    </MaxWidthWrapper>
  );
}
