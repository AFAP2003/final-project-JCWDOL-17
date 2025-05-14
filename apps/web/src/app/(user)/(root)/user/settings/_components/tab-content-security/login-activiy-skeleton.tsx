import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';

export default function LoginActivitySkeleton() {
  return (
    <div className="mb-12 w-full">
      <Skeleton className="h-6 w-40 mb-6" /> {/* Section heading */}
      <div className="flex items-start sm:items-center text-sm gap-3 mb-6 flex-col sm:flex-row">
        <Lightbulb className="size-6 text-red-500 shrink-0" />
        <Skeleton className="h-4 w-[90%] sm:w-[70%]" />
      </div>
      <div className="bg-neutral-50 rounded-lg p-4 sm:p-6 border shadow-sm divide-y divide-neutral-200">
        {[...Array(1)].map((_, i) => (
          <div key={i} className="py-4 px-2 sm:px-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
              <div className="flex gap-4 items-center w-full max-w-full">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex flex-col gap-1 overflow-hidden w-full">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
