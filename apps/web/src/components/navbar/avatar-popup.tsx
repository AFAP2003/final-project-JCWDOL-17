'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { signOut } from '@/lib/auth/client';
import { Session } from '@/lib/types/session';
import { LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
// import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Separator } from '../ui/separator';

type Props = {
  session: Session;
};

export default function AvatarPopup({ session: { session, user } }: Props) {
  // const router = useRouter();
  const [openPopup, setOpenPopup] = useState<boolean>(false);

  return (
    <Popover
      open={openPopup}
      onOpenChange={(val) => {
        setOpenPopup(val);
      }}
    >
      <PopoverTrigger>
        <div className="flex gap-2 items-center">
          <Avatar className="size-10">
            <AvatarImage src={user.image} alt="User Image"></AvatarImage>
            <AvatarFallback className="bg-neutral-200 text-neutral-800">{`${user.name.at(0)?.toUpperCase()}`}</AvatarFallback>
          </Avatar>
          {/* <div className="">{user.name.split(' ').at(0)}</div> */}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="flex flex-col font-medium">
          {/* Header  */}
          <div className="flex items-center rounded-sm gap-4">
            <Avatar className="">
              <AvatarImage src={user.image} alt="User Image"></AvatarImage>
              <AvatarFallback className="bg-neutral-200 text-neutral-800">{`${user.name.at(0)?.toUpperCase()}`}</AvatarFallback>
            </Avatar>
            <div>{user.name}</div>
          </div>

          <Separator className="my-4" />

          {/* Content */}
          <div className="flex w-full text-sm text-muted-foreground h-40">
            {/* Left Content */}
            <div className="grow">
              <Link
                href={'/orders'}
                onClick={() => setOpenPopup(false)}
                passHref
              >
                Orders
              </Link>
            </div>

            <Separator orientation="vertical" className="mx-2" />

            {/* Right Content */}
            <div className="flex flex-col h-full justify-between min-w-32">
              {/* Right Content Top */}
              <div>
                <Link
                  href={'/user/settings'}
                  onClick={() => setOpenPopup(false)}
                  passHref
                >
                  <div className="flex items-center gap-2 hover:bg-gray-100 rounded-sm px-2 py-1 cursor-pointer">
                    <Settings className="size-4" /> Settings
                  </div>
                </Link>
              </div>

              {/* Right Content Bottom */}
              <button
                onClick={async () => {
                  await signOut();
                  window.location.reload();
                  // setOpenPopup(false);
                  // router.refresh();
                }}
                className="flex gap-2 items-center cursor-pointer hover:bg-gray-100 rounded-sm px-2 py-1"
              >
                Logout <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
