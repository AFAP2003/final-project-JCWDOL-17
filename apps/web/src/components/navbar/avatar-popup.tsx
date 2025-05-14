'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useLocation } from '@/context/location-provider';
import { signOut } from '@/lib/auth/client';
import type { Session } from '@/lib/types/session';
import { CalendarArrowUp, Code2, LogOut, Settings, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
  session: Session;
};

export default function AvatarPopup({ session: { session, user } }: Props) {
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const { mutate: setLocation } = useLocation();

  return (
    <Popover
      open={openPopup}
      onOpenChange={(val) => {
        setOpenPopup(val);
      }}
    >
      <PopoverTrigger asChild>
        <button className="flex items-center gap-3 p-2 rounded-full transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400">
          <Avatar className="h-10 w-10 border-2 border-neutral-200  shadow-sm">
            <AvatarImage
              src={user.image || '/placeholder.svg'}
              alt={`${user.name}'s profile`}
            />
            <AvatarFallback className="bg-neutral-100 text-neutral-700 font-medium">
              {`${user.name.at(0)?.toUpperCase()}`}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-neutral-700 hidden lg:block">
            {user.name.split(' ').at(0)}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 bg-white  border border-neutral-200  shadow-lg rounded-lg overflow-hidden">
        <div className="flex flex-col">
          {/* Header */}
          <div className="p-4 bg-neutral-50 /50">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-neutral-200  shadow-sm">
                <AvatarImage
                  src={user.image || '/placeholder.svg'}
                  alt={`${user.name}'s profile`}
                />
                <AvatarFallback className="bg-neutral-100 text-neutral-700   font-medium">
                  {`${user.name.at(0)?.toUpperCase()}`}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-neutral-900  line-clamp-1">
                  {user.name}
                </span>
                <span className="text-xs text-neutral-500  line-clamp-1">
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          <Separator className="bg-neutral-200 " />

          {/* Content */}
          <div className="p-2">
            <div className="flex flex-col gap-1">
              <Link
                href="/user/settings"
                onClick={() => setOpenPopup(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-neutral-700  hover:bg-neutral-100 transition-colors"
              >
                <Settings className="size-4 text-neutral-700 " />
                <span className="text-sm font-medium">Pengaturan</span>
              </Link>

              <Link
                href="/user/my-vouchers"
                onClick={() => setOpenPopup(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-neutral-700  hover:bg-neutral-100 transition-colors"
              >
                <Ticket className="size-4 text-neutral-700" />
                <span className="text-sm font-medium">Voucher Saya</span>
              </Link>

              <Link
                href="/user/referral-code"
                onClick={() => setOpenPopup(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-neutral-700  hover:bg-neutral-100 transition-colors"
              >
                <Code2 className="size-4 text-neutral-700" />
                <span className="text-sm font-medium">Kode Referral</span>
              </Link>

              <Link
                href={'/orders'}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-neutral-700  hover:bg-neutral-100 transition-colors"
                onClick={() => setOpenPopup(false)}
                passHref
              >
                <CalendarArrowUp className="size-4 text-neutral-700" />
                <span className="text-sm font-medium">Orders</span>
              </Link>
            </div>
          </div>

          <Separator className="bg-neutral-200  my-1" />

          {/* Footer */}
          <div className="p-2">
            <button
              onClick={async () => {
                await signOut();
                setLocation(null);
                window.location.reload();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-neutral-700  hover:bg-neutral-100 transition-colors"
            >
              <LogOut className="size-4 text-neutral-700 " />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
