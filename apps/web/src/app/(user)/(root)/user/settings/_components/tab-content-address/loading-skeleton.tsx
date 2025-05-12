'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import SearchBox from './search-box';

export default function LoadingSkeleton() {
  return (
    <>
      <Card className="p-6">
        <div className="w-full">
          <div className="flex w-full justify-between mb-8 gap-12">
            <SearchBox search={''} setSearch={() => {}} />
            <Button
              onClick={() => {}}
              className="bg-neutral-800/90 hover:bg-neutral-800/90 text-neutral-200 hover:text-neutral-300 transition-all duration-300"
            >
              <Plus className="size-4" />
              New Address
            </Button>
          </div>

          <div className="space-y-6">
            {[1].map((item, idx) => (
              <Card
                key={idx}
                className="w-full overflow-hidden border shadow-sm transition-all"
              >
                <CardHeader className="bg-neutral-200 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-24 rounded" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4 bg-neutral-50">
                  <div className="space-y-3">
                    {/* Recipient + Phone */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28 rounded" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-3 w-24 rounded" />
                      </div>
                    </div>

                    {/* Address Text */}
                    <div className="space-y-2 border-l-2 border-neutral-400 pl-3 text-sm">
                      <Skeleton className="h-3 w-64 rounded" />
                      <Skeleton className="h-3 w-48 rounded" />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-3">
                      <Skeleton className="h-8 w-20 rounded-md" />
                      <Skeleton className="h-8 w-24 rounded-md" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}
