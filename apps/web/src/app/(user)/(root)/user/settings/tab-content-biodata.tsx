'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { useSession } from '@/lib/auth/client';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default function TabContentBiodata() {
  const { data, isPending } = useSession();
  if (isPending) return null;
  if (!data) notFound();

  const { session, user } = data;

  return (
    <TabsContent value="biodata">
      <Card className="flex gap-12 p-6">
        {/* Left Content */}
        <div>
          {/* Image */}
          <div className="p-4 border rounded-lg shadow">
            <div className="relative aspect-square mb-4 w-60">
              <Image src={user.image || ''} alt="User Image" fill />
            </div>
            <Button variant={'ghost'} className="w-full border text-sm mb-4">
              Select Image
            </Button>
            <p className="w-60 text-sm text-muted-foreground text-pretty">
              File size: maximum 10,000,000 bytes (10 Megabytes). Allowed file
              extensions: .JPG .JPEG .PNG
            </p>
          </div>
        </div>

        {/* Right Content */}
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-6">Change Your Bio</h3>
            <div className="text-sm flex w-full gap-12 text-gray-700">
              {/* Bio Field */}
              <div className="flex flex-col gap-4 w-24">
                <div>First Name</div>
                <div>Last Name</div>
                <div>Date of birth</div>
                <div>Gender</div>
              </div>

              {/* Bio Value */}
              <div className="flex flex-col grow gap-4">
                <div>{user.firstName}</div>
                <div>{user.lastName}</div>
                <div>27 Oktober 1998</div>
                <div>Men</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-6">Change Your Contact</h3>
            <div className="text-sm flex w-full gap-12 text-gray-700">
              {/* Contact Field */}
              <div className="flex flex-col gap-4 w-24">
                <div>Email</div>
                <div>Phone</div>
              </div>

              {/* Contact Value */}
              <div className="flex flex-col grow gap-4">
                <div>{user.email}</div>
                <div>{'081885884883'}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </TabsContent>
  );
}
