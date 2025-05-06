import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategorySalesChartSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="">
       <div className='flex items-center justify-between'>
         {/* Title */}
         <CardTitle>
          <Skeleton className="h-6 w-40" />
        </CardTitle>
        <div className='flex gap-4'>
             {/* Year selector placeholder */}
        <Skeleton className="h-8 w-20" />
         {/* Year selector placeholder */}
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
