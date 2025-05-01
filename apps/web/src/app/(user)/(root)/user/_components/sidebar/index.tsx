'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useSession } from '@/lib/auth/client';
import { Settings, Ticket } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function UserSidebar() {
  const { data, isPending } = useSession();

  if (isPending) return null;
  if (!data) redirect('/auth/signin');

  const { user } = data;

  return (
    <Card className="w-full max-w-64 max-h-[720px] top-0 sticky flex flex-col rounded-lg overflow-hidden bg-gradient-to-b from-neutral-800 to-neutral-700 text-neutral-200">
      <div className="flex gap-3 items-center p-6">
        <Avatar className="size-12">
          <AvatarImage src={user.image} alt="User Image"></AvatarImage>
          <AvatarFallback className="bg-neutral-200 text-neutral-800">{`${user.name.at(0)?.toUpperCase()}`}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-lg">{user.name}</div>
        </div>
      </div>

      {/* <Separator className="" /> */}

      <div className="grow px-6 pb-6">
        <Accordion
          type="multiple"
          defaultValue={['Account']}
          className="w-full"
        >
          <AccordionItem value="Account">
            {/* Account Group */}
            <AccordionTrigger className="text-base">Account</AccordionTrigger>

            <AccordionContent className="text-sm text-neutral-300">
              <Link href={'/user/settings'} passHref>
                <div className="flex items-center gap-2 rounded-md hover:px-3 py-2 cursor-pointer font-medium transition-all hover:bg-neutral-700 text-neutral-200">
                  <Settings className="size-5" /> <span>Settings</span>
                </div>
              </Link>
            </AccordionContent>

            {/* TODO: */}
            <AccordionContent className="text-sm text-neutral-300">
              <Link href={'#'} passHref>
                <div className="flex items-center gap-2 rounded-md hover:px-3 py-2 cursor-pointer font-medium transition-all hover:bg-neutral-700 text-neutral-200">
                  <Ticket className="size-5" /> <span>My Voucher</span>
                </div>
              </Link>
            </AccordionContent>
          </AccordionItem>

          {/* Other Group */}
        </Accordion>
      </div>
    </Card>
  );
}
