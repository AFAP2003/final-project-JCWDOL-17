'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLocation } from '@/context/location-provider';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';
import { useIsClient } from 'usehooks-ts';

interface Props {
  className?: string;
}

export function LocationButton({ className }: Props) {
  const { data: location, isPending } = useLocation();
  const isclient = useIsClient();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'group flex items-center justify-center relative cursor-pointer',
              className,
            )}
          >
            {/* If children exist, render them */}
            <div key={location?.address} className="flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                {/* Subtle background effect on hover */}
                <div className="absolute inset-0 rounded-full opacity-0 bg-neutral-200 transition-opacity duration-200 group-hover:opacity-20" />

                {/* Icon container */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors duration-200 group-hover:text-neutral-900-neutral-100">
                  {/* Status indicator */}
                  {!isPending && isclient && (
                    <div
                      className={cn(
                        'absolute -right-1 -top-1 h-3 w-3 rounded-full border border-white',
                        location ? 'bg-green-500' : 'bg-neutral-500',
                      )}
                    />
                  )}
                  {/* Map icon - using the same size as ShoppingBag */}
                  <MapPin className="size-6" />
                </div>
              </div>

              {/* Label */}
              <div className="text-xs font-medium text-neutral-600 transition-colors duration-200 group-hover:text-neutral-900-neutral-200">
                Lokasi
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-white border-neutral-200 text-neutral-800 shadow-md"
        >
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                location ? 'bg-green-500' : 'bg-neutral-500',
              )}
            />
            <span className="max-w-sm line-clamp-1 bg-neutral-100">
              {location?.address || 'Tidak ada lokasi terpilih'}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
