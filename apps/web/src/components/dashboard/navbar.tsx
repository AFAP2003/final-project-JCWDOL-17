'use client';

import { ChevronDown, Menu,LogOut } from 'lucide-react';

type NavbarProps = {
  onToggleSidebar: () => void;
};

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Avatar, AvatarFallback, AvatarImage, } from '@/components/ui/avatar';
import { signOut, useSession } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { data: session, isPending, refetch } = useSession();
  if (isPending) {
    return <div></div>;
  }
  const user = session?.user;
  const router = useRouter();

  return (
    <nav className="flex items-center h-[50px] px-4 sm:px-10 border-b bg-white justify-between sm:justify-end">
      {/* Hamburger button: visible on small screens */}
      <button
        className="sm:hidden inline-flex items-center justify-center p-2 text-white"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <div className="border rounded-sm p-1">
          <Menu className="w-5 h-5 text-black" />
        </div>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-gray-200 transition">
          {/* <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="Admin avatar" />
            <AvatarFallback>AU</AvatarFallback>
          </Avatar> */}
          <Avatar className="h-8 w-8">
            {session?.user?.image ? (
              <AvatarImage
                src={session?.user?.image}
                alt={session?.user?.name}
              />
            ) : (
              <AvatarFallback>
                {session?.user?.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="text-left">
            {/* <div className="text-sm font-medium leading-none">Admin User</div>
            <div className="text-xs text-muted-foreground">Super Admin</div> */}
            <div className="text-sm font-medium leading-none">{user?.name}</div>
            <div className="text-xs text-muted-foreground">
              {user?.role == 'SUPER'
                ? 'Super Admin'
                : user?.role == 'ADMIN'
                  ? 'Store Admin'
                  : user?.role}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-[#ef4444]"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await signOut();
              refetch();
              router.push('/admin/auth/signin');
            }}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
