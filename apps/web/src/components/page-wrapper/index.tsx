'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function PageWrapper({ children }: Props) {
  // const { isFullNavbar } = useNavbar();

  return (
    <div
      className={cn(
        'relative grow flex flex-col translate-y-[220px] transition-all duration-100',
        // isFullNavbar && 'translate-y-[220px]',
      )}
    >
      <div className="py-12">{children}</div>
    </div>
  );
}
