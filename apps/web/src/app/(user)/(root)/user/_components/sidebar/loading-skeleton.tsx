import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingSkeleton() {
  return (
    <Card className="w-full max-w-64 h-[700px] flex flex-col rounded-lg overflow-hidden border border-neutral-200 bg-white/80 shadow-sm">
      {/* Profile Skeleton */}
      <div className="bg-neutral-50 p-6">
        <div className="flex gap-4 items-center">
          <Skeleton className="size-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="w-32 h-4 rounded" />
          </div>
        </div>
      </div>

      <Separator className="bg-neutral-200" />

      {/* Navigation Skeleton */}
      <div className="grow px-4 py-4 space-y-4 bg-white">
        <Skeleton className="w-full h-5 rounded" />
        <div className="space-y-3 pl-4">
          <Skeleton className="w-36 h-4 rounded" />
          <Skeleton className="w-36 h-4 rounded" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="mt-auto p-4 bg-neutral-50 border-t border-neutral-200">
        <Skeleton className="w-24 h-4 rounded" />
      </div>
    </Card>
  );
}
