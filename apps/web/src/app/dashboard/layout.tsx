'use client';

import { useState } from 'react';
import { fontInter } from '../fonts';
import '../globals.css';

import Navbar from '@/components/dashboard/navbar';
import Sidebar from '@/components/dashboard/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`${fontInter.variable} antialiased font-inter flex`}>
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex w-screen flex-col gap-4">
        {/* Navbar or Header */}
        <Navbar onToggleSidebar={(n) => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <div className="sm:p-10">{children}</div>
      </div>
    </div>
  );
}
