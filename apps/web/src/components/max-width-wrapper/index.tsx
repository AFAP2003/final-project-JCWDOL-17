import { cn } from '@/lib/utils';
import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function MaxWidthWrapper({ children, className }: Props) {
  return (
    <div className={cn('size-full mx-auto max-w-[1440px] px-8', className)}>
      {children}
    </div>
  );
}
