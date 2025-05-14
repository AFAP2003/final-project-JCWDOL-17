// components/store-page-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function ContentSkeleton() {
  return (
    <div className="w-full">
      <div className="mb-12 mt-9">
        <div className="flex max-w-7xl gap-4 max-xl:flex-col">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[90px] w-full rounded-xl" />
          ))}
        </div>
      </div>

      <div className="w-full sm:w-[calc(92vw)] md:w-[calc(93vw-255px)] overflow-x-auto">
        <div className="mb-4 text-neutral-700 font-semibold">Daftar Toko</div>

        <div className="flex flex-col min-[480px]:flex-row w-full justify-between min-[480px]:items-center py-4 px-1 gap-x-6 gap-y-3">
          <Skeleton className="h-[24px] w-full max-w-sm rounded-xl" />
          <Skeleton className="h-[24px] w-full max-w-[150px] rounded-xl" />
        </div>

        <div className="overflow-x-auto w-full sm:w-[calc(92vw)] md:w-[calc(93vw-255px)]">
          <div className="border rounded-xl">
            {[...Array(10)].map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="flex items-center space-x-4 border-b px-4 py-3"
              >
                {[...Array(5)].map((_, colIndex) => {
                  return (
                    <Skeleton
                      key={colIndex}
                      className={cn(
                        'h-8 w-[120px] rounded bg-neutral-300',
                        colIndex === 1 && 'w-full',
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
