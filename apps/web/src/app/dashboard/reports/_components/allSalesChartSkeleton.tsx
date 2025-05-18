import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import UseProductManagement from '@/hooks/useProductManagement';

export default function AllSalesChartSkeleton() {
  const {user,isSessionLoading} = UseProductManagement()
   if (isSessionLoading) {
    return <Skeleton className="h-9 w-36" />;
  }
  
  if (!user) return <div></div>;
  return (
    <Card className="w-full">
      <CardHeader className="">
       <div className='flex items-center justify-between'>
         {/* Title */}
         <CardTitle>
          <Skeleton className="h-6 w-28" />
        </CardTitle>
        {/* Year selector placeholder */}
        <div className='flex gap-4'>
          {user.role=='SUPER'&&(
            <Skeleton className="h-8 w-20" />
          )}
            <Skeleton className="h-8 w-20" />


          </div>        
       </div>
      </CardHeader>
      <CardContent className='flex flex-col items-center justify-center gap-2'>
        {/* Chart area placeholder */}
        <Skeleton className="h-[360px] w-full" />
        <CardTitle>
          <Skeleton className="h-6 w-28" />
        </CardTitle>
      </CardContent>
    </Card>
  );
}
