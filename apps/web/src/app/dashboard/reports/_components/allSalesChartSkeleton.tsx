import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import UseProductManagement from '@/hooks/useProductManagement';

export default function AllSalesChartSkeleton() {
  const { user, isSessionLoading } = UseProductManagement();
  if (isSessionLoading) {
    return <div></div>;
  }

  if (!user) return <div></div>;
  return (
    <Card className="w-full">
      <CardHeader className="">
        <div className="flex items-center justify-between">
          {/* Title */}
          <CardTitle>
            <Skeleton className="h-6 w-28" />
          </CardTitle>
          {/* Year selector placeholder */}
          <div className="sm:flex sm:gap-4 flex-col ">
            {user.role == 'SUPER' && <Skeleton className="h-8 w-32" />}
            <div className='flex justify-end'>
            <Skeleton className="h-8 w-20 mt-2 " />

            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-2">
        {/* Chart area placeholder */}
        <Skeleton className="h-[360px] w-full" />
        <CardTitle>
          <Skeleton className="h-6 w-28" />
        </CardTitle>
      </CardContent>
    </Card>
  );
}
