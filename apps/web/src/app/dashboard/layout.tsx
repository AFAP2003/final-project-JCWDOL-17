'use client';

import { useState, useEffect } from 'react';
import { fontInter } from '../fonts';
import '../globals.css';

import Navbar from '@/components/dashboard/navbar';
import Sidebar from '@/components/dashboard/sidebar';
import { useSession } from '@/lib/auth/client';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // only redirect when first landing on `/dashboard`
  useEffect(() => {
    if (!isPending && session && pathname === '/dashboard') {
      if (session.user.role === 'ADMIN') {
        router.replace('/dashboard/products');
      } else {
        router.replace('/dashboard/users');
      }
    }
  }, [isPending, session, pathname, router]);

  // you can show a full-screen loader while session is loading
  if (isPending) {
    return (
      <div className={fontInter.variable + ' h-screen flex items-center justify-center'}>
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  return (
    <div className={`${fontInter.variable} antialiased font-inter flex`}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex w-screen flex-col gap-4">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="sm:p-10">{children}</div>
      </div>
    </div>
  );
}
