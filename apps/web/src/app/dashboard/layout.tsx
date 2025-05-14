'use client';

import { useState } from 'react';
import { fontInter } from '../fonts';
import '../globals.css';

import Sidebar from '@/components/dashboard/sidebar';
import { Menu } from 'lucide-react';
import Navbar from '@/components/dashboard/navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <html lang="en">
      <body className={`${fontInter.variable} antialiased font-inter`}>
        <div className="flex">
          {/* Sidebar */}
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Main Content Area */}
          <div className="flex w-screen flex-col gap-4">
            {/* Navbar or Header */}
            <Navbar onToggleSidebar={(n)=>setSidebarOpen(!sidebarOpen)}/>

            {/* Page Content */}
            <div className="sm:p-10">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
