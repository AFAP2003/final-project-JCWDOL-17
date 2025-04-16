'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { useSession } from '@/lib/auth/client';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import SectionHeading from './section-heading';

export default function TabContentBiodata() {
  const { data, isPending } = useSession();
  if (!isPending && !data) redirect('/auth/signin');

  return (
    <TabsContent value="biodata">
      {!isPending && (
        <Card className="p-6">
          <div className="flex max-lg:flex-col gap-12 w-full">
            {/* Left Content */}
            <div className="p-4 border rounded-lg shadow">
              <div className="relative aspect-square mb-4 w-60 mx-auto">
                {!data?.user.image ? (
                  <div className="size-full bg-muted flex items-center justify-center">
                    <span className="text-8xl font-[300]">{`${data?.user.firstName.at(0)?.toUpperCase()}${data?.user.lastName ? data?.user.lastName.at(0)?.toUpperCase() : data?.user.firstName.at(1)?.toUpperCase()}`}</span>
                  </div>
                ) : (
                  <Image src={data?.user.image} alt="User Image" fill />
                )}
              </div>
              <Button variant={'ghost'} className="w-full border text-sm mb-4">
                Select Image
              </Button>
              <p className="w-60 text-sm text-muted-foreground text-pretty">
                File size: maximum 10,000,000 bytes (10 Megabytes). Allowed file
                extensions: .JPG .JPEG .PNG
              </p>
            </div>

            {/* Right Content */}
            <div className="w-full">
              <div className="mb-12">
                <SectionHeading>Change Your Bio</SectionHeading>
                <div className="text-sm grid grid-cols-[30%_70%] grid-rows-4 w-full gap-4 text-gray-700">
                  {/* Bio */}
                  <div>First Name</div>
                  <div>{data?.user.firstName || ''}</div>

                  <div>Last Name</div>
                  <div>{data?.user.lastName || ''}</div>

                  <div>Date of birth</div>
                  <div>27 Oktober 1998</div>

                  <div>Gender</div>
                  <div>Men</div>
                </div>
              </div>

              <div className="mb-12">
                <SectionHeading>Change Your Contact</SectionHeading>
                <div className="text-sm grid grid-cols-[30%_70%] grid-rows-2 w-full gap-4 text-gray-700">
                  {/* Contact Field */}
                  <div>Email</div>
                  <div className="line-clamp-1">{data?.user.email || ''}</div>

                  <div>Phone</div>
                  <div>{'081885884883'}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </TabsContent>
  );
}
