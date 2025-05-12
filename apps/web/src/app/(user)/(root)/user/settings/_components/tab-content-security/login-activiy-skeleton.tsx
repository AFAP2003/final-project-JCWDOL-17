import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';
import SectionHeading from '../section-heading';

export default function LoginActivitySkeleton() {
  return (
    <div className="mb-12 w-full">
      <SectionHeading>Login Activity</SectionHeading>

      <div className="flex items-center text-sm gap-3 mb-6">
        <Lightbulb className="size-6 text-red-500" />
        <p className="text-neutral-500">
          If there is any unfamiliar activity, immediately click &quot;Sign
          Out&quot; and{' '}
          <span
            // onClick={() => resetPassword()}
            className="underline underline-offset-4 cursor-pointer text-red-500 hover:text-red-500"
          >
            change your password
          </span>
          .
        </p>
      </div>

      <Card className="bg-neutral-50 rounded-lg border shadow-sm">
        <CardContent className="p-6 space-y-6">
          {[...Array(1)].map((_, i) => (
            <div key={i}>
              <div className="flex justify-between items-center px-3">
                <div className="flex gap-3 items-center">
                  <Skeleton className="size-12 rounded-md" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              {i < 2 && (
                <Skeleton className="h-[1px] my-4 w-full bg-neutral-300" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
