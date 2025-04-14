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
import { useSession } from '@/lib/auth/client';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function UserSidebar() {
  const { data, isPending } = useSession();

  if (isPending) return null;
  if (!data) notFound();

  const { user, session } = data;

  return (
    <Card className="w-64 p-2 flex flex-col">
      <div className="flex gap-2 items-center p-2 pb-4">
        <Avatar className="size-12">
          <AvatarImage src={user.image} alt="User Image"></AvatarImage>
          <AvatarFallback>{`${user.firstName.at(0)?.toUpperCase()}${user.lastName ? user.lastName.at(0)?.toUpperCase() : user.firstName.at(1)?.toUpperCase()}`}</AvatarFallback>
        </Avatar>
        <div>
          <div>{user.firstName}</div>
        </div>
      </div>

      <Separator className="" />

      <div className="pt-4 text-gray-700 grow px-2">
        <Accordion
          type="multiple"
          defaultValue={['Account']}
          className="w-full"
        >
          <AccordionItem value="Account">
            <AccordionTrigger>Account</AccordionTrigger>
            <AccordionContent>
              <Link href={'/user/settings'} passHref>
                <div className="flex items-center gap-2 hover:bg-gray-100 rounded-sm px-2 py-1 cursor-pointer text-muted-foreground font-medium">
                  <Settings className="size-5" /> Settings
                </div>
              </Link>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Card>
  );
}
