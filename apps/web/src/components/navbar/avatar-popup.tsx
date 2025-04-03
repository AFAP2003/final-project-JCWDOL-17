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
import { Separator } from '../ui/separator';

type Props = {
  session: Session;
};

export default function AvatarPopup({ session: { session, user } }: Props) {
  return (
    <Popover>
      <PopoverTrigger>
        <div className="flex gap-2 items-center">
          <Avatar>
            <AvatarImage src={user.image} alt="User Image"></AvatarImage>
            <AvatarFallback>{`${user.firstName.at(0)?.toUpperCase()}${user.lastName ? user.lastName.at(0)?.toUpperCase() : user.firstName.at(1)?.toUpperCase()}`}</AvatarFallback>
          </Avatar>
          <div className="">{user.firstName}</div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="flex flex-col font-medium">
          {/* Header  */}
          <div className="flex items-center rounded-sm gap-4">
            <Avatar className="">
              <AvatarImage src={user.image} alt="User Image"></AvatarImage>
              <AvatarFallback>{`${user.firstName.at(0)?.toUpperCase()}${user.lastName ? user.lastName.at(0)?.toUpperCase() : user.firstName.at(1)?.toUpperCase()}`}</AvatarFallback>
            </Avatar>
            <div>{user.fullName}</div>
          </div>

          <Separator className="my-4" />

          {/* Content */}
          <div className="flex w-full text-sm text-muted-foreground h-40">
            {/* Left Content */}
            <div className="grow">[OTHER]</div>

            <Separator orientation="vertical" className="mx-2" />

            {/* Right Content */}
            <div className="flex flex-col h-full justify-between min-w-32">
              {/* Right Content Top */}
              <div>
                <Link href={'/user/settings'} passHref>
                  <div className="flex items-center gap-2 hover:bg-gray-100 rounded-sm px-2 py-1 cursor-pointer">
                    <Settings className="size-4" /> Settings
                  </div>
                </Link>
              </div>

              {/* Right Content Bottom */}
              <div
                onClick={() => signOut()}
                className="flex gap-2 items-center cursor-pointer hover:bg-gray-100 rounded-sm px-2 py-1"
              >
                Logout <LogOut className="size-4" />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
