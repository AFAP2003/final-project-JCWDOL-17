'use client';

import { useSession } from '@/lib/auth/client';
import Logo from '../logo';
import AuthButton from './auth-button';
import AvatarPopup from './avatar-popup';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const { data: session, isPending } = useSession();
  return (
    <nav className="h-20 border-b px-8 py-4">
      <div className="flex size-full items-center justify-between">
        <div>
          <Logo href="/" />
        </div>
        <div className="grow border-x flex justify-center items-center mx-16 h-full">
          [SEARCH BAR]
        </div>
        <div className="flex items-center gap-6">
          {/* Dev To Be Deleted or Edit */}
          <Link href="/orders" passHref>
            <Button variant="ghost" size="icon" title="My Orders">
              <ShoppingBag className="h-30 w-30" />
            </Button>
          </Link>
        </div>
        <div>
          {isPending || !session ? (
            <AuthButton />
          ) : (
            <AvatarPopup session={session} />
          )}
        </div>
      </div>
    </nav>
  );
}
