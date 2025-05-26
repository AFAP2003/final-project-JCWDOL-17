'use client';

import { useLocation } from '@/context/location-provider';
import { useNavbar } from '@/context/navbar-provider';
import { signOut, useSession } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import {
  CalendarArrowUp,
  Code2,
  LogOut,
  MapPin,
  Menu,
  Settings,
  Ticket,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useIsClient, useMediaQuery } from 'usehooks-ts';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import UserLocation from '../user-location';
import AuthButton from './auth-button';
import AvatarPopup from './avatar-popup';
import { CartButton } from './cart-button';
import { LocationButton } from './location-button';
import NavbarSkeleton from './navbar-skeleton';
import SearchBox from './search-box';

export default function Navbar() {
  const isTablet = useMediaQuery('(max-width: 840px)');
  const isClient = useIsClient();

  if (!isClient) {
    return <NavbarSkeleton />;
  }

  return <>{isTablet ? <TabletNavbar /> : <DesktopNavbar />}</>;
}

function DesktopNavbar() {
  const { data: session, isPending } = useSession();
  const { isFullNavbar } = useNavbar();
  const router = useRouter();

  const isLogin = !isPending && session?.user && session.user.role === 'USER';

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
            <div className="relative -left-1 flex items-center justify-center max-md:mr-1">
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
              <SearchBox />

              <CartButton />

              {/* MAP Lokasi */}
              <UserLocation>
                <LocationButton />
              </UserLocation>
            </div>

            {/* Right Content */}
            <div className="flex items-center justify-center ml-3">
              {/* User Profile | Auth Button */}
              <div>
                {isLogin ? <AvatarPopup session={session!} /> : <AuthButton />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function TabletNavbar() {
  const { data: session, isPending } = useSession();
  const { data: location, mutate: setLocation } = useLocation();
  const { isFullNavbar } = useNavbar();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const isLogin = !isPending && session?.user && session.user.role === 'USER';

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
            {/* <p className="italic relative left-3">Fresh grocery store</p> */}
            <div
              onClick={() => router.push('/')}
              className="relative w-56 h-28 cursor-pointer"
            >
              <Image src={'/images/app-logo-black.png'} alt="App Logo" fill />
            </div>
            {/* <p className="italic">from Indonesia</p> */}
          </div>

          <Separator className="bg-neutral-500 h-1 rounded-full" />
        </div>

        <div
          className={cn(
            'absolute top-0 left-0 h-[80px] w-full py-1.5 px-6 transition-all duration-500',
            isFullNavbar && 'translate-y-[140px]',
          )}
        >
          <div className="flex w-full h-full justify-between items-center gap-3">
            {/* Center Content */}
            <div className="grow flex justify-center items-center gap-4 w-full max-w-xl">
              <SearchBox
                onSearchStart={() => setIsSearching(true)}
                onSearchEnd={() => setIsSearching(false)}
              />
            </div>

            {/* Right Content */}
            <div
              className={cn(
                'flex items-center justify-center gap-2 transition-all',
                isSearching && 'opacity-50 w-0 overflow-clip',
              )}
            >
              <CartButton />

              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger>
                  <Menu className="size-7" />
                </SheetTrigger>
                <SheetContent className="bg-neutral-800 border-neutral-500 text-neutral-200">
                  <div>
                    {/* Logo Top */}
                    <div className="w-full flex flex-col justify-center items-center">
                      <div
                        onClick={() => router.push('/')}
                        className="relative w-40 h-20 cursor-pointer"
                      >
                        <Image
                          src={'/images/app-logo-white.png'}
                          alt="App Logo"
                          fill
                        />
                      </div>
                      <p className="italic text-sm">
                        Fresh grocery store from Indonesia
                      </p>
                    </div>

                    <Separator className="bg-neutral-500 h-1 rounded-full my-6" />

                    {/* Location */}
                    <div className="mt-9">
                      <div className="mb-3 flex gap-2 items-center">
                        <MapPin className="size-4 text-red-500" />
                        <h3 className="font-medium text-sm">Your Location</h3>
                      </div>

                      <UserLocation modal={false}>
                        <div className="flex gap-3 items-center p-3 border rounded-lg border-neutral-500 hover:bg-neutral-700/20 transition-all">
                          <div
                            className={cn(
                              'h-3 w-3 rounded-full border border-white shrink-0',
                              location ? 'bg-green-500' : 'bg-neutral-500',
                            )}
                          />
                          <div className="line-clamp-1 text-neutral-300 text-xs">
                            {location?.address ||
                              'Tidak ada lokasi yang dipilih'}
                          </div>
                        </div>
                      </UserLocation>
                    </div>

                    <Separator className="bg-neutral-500 rounded-full my-6" />

                    {/* Account and Link */}
                    {isLogin ? (
                      <div className="mt-9">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 border-2 border-neutral-500  shadow-sm">
                            <AvatarImage
                              src={session.user.image || '/placeholder.svg'}
                              alt={`${session.user.name}'s profile`}
                            />
                            <AvatarFallback className="bg-neutral-100 text-neutral-700 font-medium">
                              {`${session.user.name.at(0)?.toUpperCase()}`}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col text-neutral-300">
                            <span className="font-medium text-sm line-clamp-1">
                              {session.user.name}
                            </span>
                            <span className="text-xs line-clamp-1">
                              {session.user.email}
                            </span>
                          </div>
                        </div>

                        <Separator className="bg-neutral-500 rounded-full my-6" />

                        {/* Link */}
                        <div className="flex flex-col gap-1">
                          <Link
                            onClick={() => setSheetOpen(false)}
                            href="/user/settings"
                            className="flex items-center gap-3 p-2 rounded-md text-neutral-300  hover:bg-neutral-700 transition-colors"
                          >
                            <Settings className="size-4 text-neutral-300 " />
                            <span className="text-sm font-medium">
                              Pengaturan
                            </span>
                          </Link>

                          <Link
                            onClick={() => setSheetOpen(false)}
                            href="/user/my-vouchers"
                            className="flex items-center gap-3 p-2 rounded-md text-neutral-300  hover:bg-neutral-700 transition-colors"
                          >
                            <Ticket className="size-4 text-neutral-300" />
                            <span className="text-sm font-medium">
                              Voucher Saya
                            </span>
                          </Link>

                          <Link
                            onClick={() => setSheetOpen(false)}
                            href="/user/referral-code"
                            className="flex items-center gap-3 p-2 rounded-md text-neutral-300  hover:bg-neutral-700 transition-colors"
                          >
                            <Code2 className="size-4 text-neutral-300" />
                            <span className="text-sm font-medium">
                              Kode Referral
                            </span>
                          </Link>

                          <Link
                            onClick={() => setSheetOpen(false)}
                            href={'/orders'}
                            className="flex items-center gap-3 p-2 rounded-md text-neutral-300  hover:bg-neutral-700 transition-colors"
                          >
                            <CalendarArrowUp className="size-4 text-neutral-300" />
                            <span className="text-sm font-medium">Orders</span>
                          </Link>

                          {/* Logout */}
                          <button
                            onClick={async () => {
                              await signOut();
                              setLocation(null);
                              setSheetOpen(false);
                              window.location.reload();
                            }}
                            className="w-full flex items-center gap-3 p-2 rounded-md text-neutral-300  hover:bg-neutral-700 transition-colors"
                          >
                            <LogOut className="size-4 text-neutral-300 " />
                            <span className="text-sm font-medium">Logout</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-9">
                        <div className="flex flex-col gap-4 size-full">
                          <Link href={'/auth/signin'} passHref>
                            <Button
                              className="border-neutral-500 border bg-neutral-700 w-full hover:bg-neutral-700/90 hover:text-neutral-100"
                              variant={'ghost'}
                              size={'sm'}
                            >
                              Sign In
                            </Button>
                          </Link>
                          <Link href={'/auth/signup'} passHref>
                            <Button
                              className="border-neutral-500 border bg-neutral-200 text-neutral-700 hover:bg-neutral-200/90 hover:text-neutral-800 w-full"
                              size={'sm'}
                            >
                              Sign Up
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
