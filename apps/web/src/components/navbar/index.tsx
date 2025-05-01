'use client';

import { useNavbar } from '@/context/navbar-provider';
import { useSession } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import { Search, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import UserLocation from '../user-location';
import AuthButton from './auth-button';
import AvatarPopup from './avatar-popup';

export default function Navbar() {
  const { data: session, isPending } = useSession();

  const { isFullNavbar } = useNavbar();
  const router = useRouter();

  // TODO: cart count state
  const cartcount = 12;

  return (
    <nav className="relative text-neutral-800 overflow-hidden z-50">
      <div
        className={cn(
          'fixed top-0 left-0 w-full h-[80px] bg-neutral-50 transition-all duration-500 px-6 shadow-sm border-b border-neutral-100',
          isFullNavbar && 'h-[220px]',
        )}
      >
        <div
          className={cn(
            'w-full flex flex-col justify-center items-center text-neutral-500 font-medium transition-all duration-500 font-bitter py-3',
            !isFullNavbar && '-translate-y-full',
          )}
        >
          <div className="w-full flex justify-center items-center">
            <p className="italic relative left-3">Fresh grocery store</p>
            <div
              onClick={() => router.push('/')}
              className="relative w-56 h-28 cursor-pointer"
            >
              <Image src={'/images/app-logo-black.png'} alt="App Logo" fill />
            </div>
            <p className="italic">from Indonesia</p>
          </div>

          <Separator className="bg-neutral-500 h-1 rounded-full" />
        </div>

        <div
          className={cn(
            'absolute top-0 left-0 h-[80px] w-full py-1.5 px-6 transition-all duration-500',
            isFullNavbar && 'translate-y-[140px]',
          )}
        >
          <div className="flex w-full h-full justify-between items-center">
            {/* Left Content */}
            <div className="flex items-center justify-center max-md:mr-1">
              <div
                onClick={() => router.push('/')}
                className={cn(
                  'relative w-32 h-16 transition-all duration-500 cursor-pointer',
                  isFullNavbar && '-translate-y-[400%]',
                )}
              >
                <Image src={'/images/app-logo-black.png'} alt="App Logo" fill />
              </div>
            </div>

            {/* Center Content */}
            <div className="grow flex justify-center items-center gap-4 w-full max-w-xl">
              {/* Search Bar */}
              <div className="flex gap-3 justify-center items-center w-full relative">
                <Search className="absolute left-2 text-neutral-600" />
                <Input
                  placeholder="Search for product..."
                  className="w-full border-t-0 border-x-0 focus-visible:ring-0 bg-neutral-50 shadow-none border-neutral-500 rounded-none pl-12"
                />
              </div>
              {/* Cart */}
              <div className="flex items-center relative">
                <Link
                  href="/cart"
                  className="flex items-center text-neutral-600"
                >
                  <ShoppingBag className="size-[25px]" />
                  <span className="absolute text-[10px] -top-3 -right-4 text-neutral-50 bg-red-500 px-[6px] py-[2px] rounded-full font-mono">
                    {cartcount}
                  </span>
                </Link>
              </div>

              <UserLocation iconClass="text-neutral-600" />
            </div>

            {/* Right Content */}
            <div className="flex items-center justify-center max-md:ml-2">
              {/* User Profile | Auth Button */}
              <div>
                {isPending || !session ? (
                  <AuthButton />
                ) : (
                  <AvatarPopup session={session} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
