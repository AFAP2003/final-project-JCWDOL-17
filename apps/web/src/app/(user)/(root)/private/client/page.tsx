'use client';

import { Button } from '@/components/ui/button';
import UserLocation from '../../../../../components/user-location';

export default function ExamplePrivatePageClient() {
  return (
    <div className="flex justify-center">
      <UserLocation>
        <Button>OPEN</Button>
      </UserLocation>
    </div>
  );
}
