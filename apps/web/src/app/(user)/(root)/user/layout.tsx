import MaxWidthWrapper from '@/components/max-width-wrapper';
import { ReactNode } from 'react';
import UserSidebar from './_components/sidebar';

type Props = {
  children: ReactNode;
};

export default function UserLayout({ children }: Props) {
  return (
    <MaxWidthWrapper className="relative flex flex-col">
      <div className="flex gap-12 py-12 grow">
        <UserSidebar />
        {children}
      </div>
    </MaxWidthWrapper>
  );
}
