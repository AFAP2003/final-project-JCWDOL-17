import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContentSkeleton() {
  return (
    <div className="bg-neutral-50 shadow p-9 rounded-md border border-neutral-100 animate-pulse">
      <div className="flex gap-12 w-full max-lg:flex-col">
        {/* Left: Image */}
        <div className="w-full">
          <div className="md:min-w-[480px] max-w-[580px] mx-auto">
            <div className="w-full aspect-square rounded-md bg-neutral-200" />
          </div>
        </div>

        {/* Right: Details */}
        <div className="text-neutral-700 w-full h-full mt-6 space-y-6">
          {/* Category & Title */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-7 w-3/4 rounded-md" />
          </div>

          <Separator className="my-6" />

          {/* Price */}
          <div className="p-6 bg-neutral-100 rounded-md">
            <Skeleton className="h-8 w-1/3 rounded-md" />
          </div>

          <Separator className="my-6" />

          {/* Thumbnails */}
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square size-20 rounded-md" />
            ))}
          </div>

          {/* Accordion */}
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-11/12 rounded-md" />
              </div>
            ))}
          </div>

          {/* Quantity & Button */}
          <div className="space-y-4">
            {/* Quantity */}
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-6 w-24 rounded-md" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-md" />
                <Skeleton className="h-10 w-12 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-md" />
              </div>
            </div>

            {/* Add to Cart Button */}
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
