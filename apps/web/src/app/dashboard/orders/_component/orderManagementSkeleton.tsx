import { Skeleton } from '@/components/ui/skeleton';

export default function OrderManagementSkeleton() {
  return (
    <div className="p-4 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-60" />
      </div>

      {/* Filters row */}
      <div className="flex justify-between">
        <div className="">
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {/* Table header */}
      <div className="border border-gray-200 rounded overflow-hidden">
        <div className="p-3 bg-gray-50 border-b">
          <div className="flex">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-6 w-full mx-2" />
            ))}
          </div>
        </div>

        {/* Table rows */}
        <div className="p-2 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-2 border-b">
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <Skeleton key={j} className="h-6 w-full mx-2" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination / footer */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-40" />
      </div>
    </div>
  );
}
