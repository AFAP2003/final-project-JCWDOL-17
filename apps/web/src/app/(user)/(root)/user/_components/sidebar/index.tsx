'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLocation } from '@/context/location-provider';
import { signOut, useSession } from '@/lib/auth/client';
import { Code2, LogOut, Settings, Ticket } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import LoadingSkeleton from './loading-skeleton';

export default function UserSidebar() {
  const { data, isPending } = useSession();
  const { mutate: setLocation } = useLocation();

  if (isPending) return <LoadingSkeleton />;
  if (!data) redirect('/auth/signin');

  const user = data?.user;

  return (
    <Card className="w-full min-w-[254px] h-[700px] hidden lg:flex shrink-0 flex-col rounded-lg overflow-hidden border border-neutral-200 bg-white/80 shadow-sm">
      {/* User Profile Section */}
      <div className="bg-neutral-50 p-6">
        <div className="flex gap-4 items-center">
          <Avatar className="size-14 border-2 border-white shadow-sm">
            <AvatarImage
              src={user.image || '/placeholder.svg'}
              alt={`${user.name}'s profile`}
            />
            <AvatarFallback className="bg-neutral-100 text-neutral-700 font-medium">{`${user.name.at(0)?.toUpperCase()}`}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="font-semibold text-lg text-neutral-700">
              {user.name}
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-neutral-200" />

      {/* Navigation Section */}
      <div className="grow px-4 py-4 bg-white">
        <Accordion
          type="multiple"
          defaultValue={['Account']}
          className="w-full"
        >
          <AccordionItem value="Account" className="border-b-neutral-200">
            <AccordionTrigger className="text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-md px-2 py-3">
              Account
            </AccordionTrigger>

            <AccordionContent className="text-sm pt-1 pb-2">
              <Link href={'/user/settings'} passHref>
                <div className="flex items-center gap-3 rounded-md px-3 py-2.5 cursor-pointer font-medium transition-all hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900">
                  <Settings className="size-4" />
                  <span>Pengaturan</span>
                </div>
              </Link>

              <Link href={`/user/my-vouchers`} passHref>
                <div className="flex items-center gap-3 rounded-md px-3 py-2.5 cursor-pointer font-medium transition-all hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900">
                  <Ticket className="size-4" />
                  <span>Voucher Saya</span>
                </div>
              </Link>

              <Link href={`/user/referral-code`} passHref>
                <div className="flex items-center gap-3 rounded-md px-3 py-2.5 cursor-pointer font-medium transition-all hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900">
                  <Code2 className="size-4" />
                  <span>Kode Referral</span>
                </div>
              </Link>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Footer Section */}
      <div className="mt-auto p-4 bg-neutral-50 border-t border-neutral-200">
        <div
          onClick={async () => {
            await signOut();
            setLocation(null);
            window.location.reload();
          }}
        >
          <div className="flex items-center gap-3 rounded-md px-3 py-2.5 cursor-pointer font-medium transition-all hover:bg-neutral-200/70 text-neutral-700">
            <LogOut className="size-4" />
            <span className="text-sm">Logout</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
