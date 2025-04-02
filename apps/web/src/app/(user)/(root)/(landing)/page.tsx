'use client';

import { Button } from '@/components/ui/button';
import { apiclient } from '@/lib/apiclient';
import { signOut, useSession } from '@/lib/auth/client';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Landing() {
  const { data, error, isPending } = useSession();
  useEffect(() => {
    if (data) {
      apiclient
        .get('/user/whoami', {
          headers: {
            Authorization: `Bearer ${data.session.token}`,
          },
        })
        .then((response: any) => {
          console.log({ whoami: response.data });
        });
    }
  }, [data]);
  return (
    <div className="min-h-screen flex flex-col gap-6 items-center justify-center">
      <h1 className="text-4xl font-bold">Landing</h1>
      <div className="flex flex-col gap-4">
        <Link href={'/auth/signin'}>Go To User Signin</Link>
        <Link href={'/auth/signup'}>Go To User Signup</Link>
        <Link href={'/private/client'}>Go To User Private Page Client</Link>
        <Link href={'/private/server'}>Go To User Private Page Server</Link>
        <Link href={'/admin/auth/signin'}>Go To Admin Signin</Link>
      </div>

      {!isPending && data && (
        <div>
          <Button
            onClick={() => {
              signOut();
            }}
          >
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}
