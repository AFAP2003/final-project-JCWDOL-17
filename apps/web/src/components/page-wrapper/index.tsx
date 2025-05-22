'use client';

import { useAuthEmail } from '@/context/auth-email-provider';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function PageWrapper({ children }: Props) {
  // const { isFullNavbar } = useNavbar();
  const { isShowing } = useAuthEmail();

  return (
    <div
      className={cn(
        !isShowing &&
          'grow flex flex-col translate-y-[220px] transition-all duration-100',
        isShowing && '',
        // isFullNavbar && 'translate-y-[220px]',
      )}
    >
      <div className="py-12">{children}</div>
    </div>
  );
}
