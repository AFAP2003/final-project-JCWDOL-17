import MaxWidthWrapper from '@/components/max-width-wrapper';
import { ReactNode } from 'react';
import UserSidebar from './_components/sidebar';

type Props = {
  children: ReactNode;
};

export default function UserLayout({ children }: Props) {
  return (
    <MaxWidthWrapper className="">
      <div className="grid grid-rows-1 grid-cols-[20%_1fr] gap-12">
        <UserSidebar />
        {children}
      </div>
    </MaxWidthWrapper>
  );
}
