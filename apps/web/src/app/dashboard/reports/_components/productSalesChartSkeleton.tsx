import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import UseProductManagement from '@/hooks/useProductManagement';

export default function ProductSalesChartSkeleton() {
  const { user, isSessionLoading } = UseProductManagement();
  if (isSessionLoading) {
    return <div></div>;
  }

  if (!user) return <div></div>;
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          {/* Title */}
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <div className="sm:flex sm:gap-4 flex-col gap-2">
            {/* Year selector placeholder */}

            {user.role == 'SUPER' && <Skeleton className="h-8 w-32" />}

            <div className='flex justify-end mt-2'>
                <Skeleton className="h-8 w-20" />

            </div>

            <div className='flex justify-end mt-2'>
            <Skeleton className="h-8 w-20" />

            </div>
            {/* Year selector placeholder */}
          </div>
        </div>
        {Array.from({ length: 10 }).map((_, idx) => (
          <div key={idx} className="flex justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle>
                <Skeleton className="h-4 w-40" />
              </CardTitle>
              <CardTitle>
                <Skeleton className="h-4 w-30" />
              </CardTitle>
            </div>
            <CardTitle>
              <Skeleton className="h-4 w-20" />
            </CardTitle>
          </div>
        ))}
      </CardHeader>
    </Card>
  );
}
