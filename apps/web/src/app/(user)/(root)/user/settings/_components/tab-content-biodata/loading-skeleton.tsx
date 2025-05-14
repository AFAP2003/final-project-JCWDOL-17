'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SectionHeading from '../section-heading';

export default function LoadingSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex max-lg:flex-col gap-12 w-full text-neutral-700 rounded-lg">
        {/* Left Content */}
        <div className="p-6 border rounded-lg shadow-sm bg-neutral-50 text-neutral-200 flex flex-col items-center h-fit">
          <Skeleton className="h-[240px] w-[240px] mb-6" />
          <Skeleton className="w-[240px] h-[32px] mb-6" />
          <Skeleton className="w-[240px] h-[40px]" />
        </div>

        {/* Right Content */}
        <div className="w-full">
          <div className="mb-12">
            <SectionHeading>Personal Information</SectionHeading>
            <div className="bg-neutral-50 rounded-lg p-6 border shadow-sm">
              <div className="text-sm grid grid-cols-[30%_70%] w-full gap-y-9">
                {/* Bio */}
                <div className="text-neutral-500 font-medium flex w-full items-center">
                  Full Name
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    <Skeleton className="w-[140px] h-[20px]" />
                  </span>

                  <Skeleton className="w-[20px] h-[20px]" />
                </div>

                <div className="text-neutral-500 font-medium flex w-full items-center">
                  Date of birth
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    <Skeleton className="w-[140px] h-[20px]" />
                  </span>
                  <Skeleton className="w-[20px] h-[20px]" />
                </div>

                <div className="text-neutral-500 font-medium flex w-full items-center">
                  Gender
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    <Skeleton className="w-[140px] h-[20px]" />
                  </span>
                  <Skeleton className="w-[20px] h-[20px]" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionHeading>Contact Information</SectionHeading>
            <div className="bg-neutral-50 rounded-lg p-6 border shadow-sm">
              <div className="text-sm grid grid-cols-[30%_70%] w-full gap-y-9">
                <div className="text-neutral-500 font-medium flex w-full items-center">
                  Email
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    <Skeleton className="w-[140px] h-[20px]" />
                  </span>
                </div>

                <div className="text-neutral-500 font-medium flex w-full items-center">
                  Phone
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    <Skeleton className="w-[140px] h-[20px]" />
                  </span>
                  <Skeleton className="w-[20px] h-[20px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
