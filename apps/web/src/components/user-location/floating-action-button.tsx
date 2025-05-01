'use client';

import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import * as React from 'react';

type Props = {
  icon?: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  children: React.ReactNode;
  className?: string;
};

export function FloatingActionButton({
  className,
  icon = <Plus className="h-5 w-5" />,
  position = 'bottom-right',
  children,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <>
      <div
        className={cn(
          'fixed z-50 rounded-full bg-neutral-800 text-neutral-200 cursor-pointer shadow-lg transition-all hover:shadow-xl size-12 flex justify-center items-center',
          positionClasses[position],
          className,
        )}
        onClick={() => setOpen(true)}
        aria-label="Open dialog"
      >
        {icon}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        {children}
      </Dialog>
    </>
  );
}
