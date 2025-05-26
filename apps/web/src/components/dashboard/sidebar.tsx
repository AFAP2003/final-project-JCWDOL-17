'use client';

import { useSession } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Boxes,
  Package,
  ShoppingCart,
  Store,
  Tag,
  User,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const sidebarItem = [
  { icon: User,       title: 'Manajemen User', href: '/dashboard/users'     },
  { icon: Package,    title: 'Produk',         href: '/dashboard/products'  },
  { icon: Boxes,      title: 'Inventaris',     href: '/dashboard/inventories'},
  { icon: ShoppingCart,title: 'Orders',        href: '/dashboard/orders'    },
  { icon: Tag,        title: 'Diskon',         href: '/dashboard/discounts' },
  { icon: Store,      title: 'Toko',           href: '/dashboard/stores'    },
  { icon: BarChart3,  title: 'Laporan',        href: '/dashboard/reports'   },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { data: session, isPending } = useSession();

  // 1) Keep hooks at the very top:
  if (isPending) {
    return <Skeleton className="h-full w-full" />;
  }

  // 2) Define itemsToRender before you return your JSX:
  const itemsToRender = sidebarItem.filter(item => {
    // If store-admin, hide users + stores links:
    if (session.user.role === 'ADMIN') {
      return (
        item.href !== '/dashboard/users' &&
        item.href !== '/dashboard/stores'
      );
    }
    return true;
  });

  return (
    <>
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 sm:w-[270px] w-[230px] bg-white p-2 sm:p-6 border transform transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'sm:static sm:translate-x-0 sm:block'
        )}
      >
        <Image
          src="/images/app-logo-black.png"
          height={200}
          width={200}
          alt="app logo"
        />

        <div className="flex flex-col sm:gap-14 gap-6 mt-10">
          {itemsToRender.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex gap-4 text-black hover:bg-gray-100 p-4 rounded-md"
            >
              <item.icon className="w-5 h-5" />
              {item.title}
            </Link>
          ))}
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black opacity-40 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
