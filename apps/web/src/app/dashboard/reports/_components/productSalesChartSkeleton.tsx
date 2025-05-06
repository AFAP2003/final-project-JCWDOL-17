import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductSalesChartSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-4">
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
