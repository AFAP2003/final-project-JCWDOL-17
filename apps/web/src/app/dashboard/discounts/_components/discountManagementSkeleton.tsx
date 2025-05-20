'use client';
import { Skeleton } from '@/components/ui/skeleton';
import UseProductManagement from '@/hooks/useProductManagement';

export default function DiscountManagementskeleton() {
  const { user, isSessionLoading } = UseProductManagement();
  if (isSessionLoading) {
    return <div></div>;
  }

  if (!user) return <div></div>;
  return (
    <div className="p-4 flex flex-col gap-6">
      {/* 1. Header + button */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 sm:w-60 w-40" />
        {user.role == 'ADMIN' && <Skeleton className="h-10 w-36" />}
      </div>

      {/* 2. Filters row */}
      <div className="hidden sm:flex justify-between ">
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

      <div className="sm:hidden flex flex-col gap-2">
        <Skeleton className="h-9 w-20 self-end" />
        <Skeleton className="h-9 w-36 self-end" />
        <Skeleton className="h-9 w-36 self-end" />

        <div className="flex justify-between">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>

      {/* 3. Table body placeholder */}
      <div className="border border-gray-200 rounded overflow-hidden">
        <div className="p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>

      {/* 4. Pagination / footer */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  );
}
