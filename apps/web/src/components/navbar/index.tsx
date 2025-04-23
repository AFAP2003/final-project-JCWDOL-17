'use client';

import { useSession } from '@/lib/auth/client';
import Logo from '../logo';
import AuthButton from './auth-button';
import AvatarPopup from './avatar-popup';

export default function Navbar() {
  const { data: session, isPending } = useSession();
  return (
    <nav className="h-20 border-b px-8 py-4 bg-gradient-to-b from-neutral-900 to-neutral-800 text-neutral-200">
      <div className="flex size-full items-center justify-between">
        <div>
          <Logo href="/" />
        </div>
        <div className="grow border-x flex justify-center items-center mx-16 h-full">
          [SEARCH BAR]
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
