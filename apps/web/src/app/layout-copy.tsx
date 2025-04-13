'use client';

import type { Metadata } from 'next'
import { fontInter } from './fonts'
import './globals.css'
import { useState } from 'react'
import Sidebar from '@/components/dashboard/sidebar'
import { Menu } from 'lucide-react'

// export const metadata: Metadata = {
//   title: '',
//   description: '',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <html lang="en">
      <body className={`${fontInter.variable} antialiased font-inter`}>
        <div className="flex min-h-screen w-full">
          {/* Sidebar */}
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
 
          {/* Main Section (Navbar + Content) */}
          <div className="flex flex-1 flex-col">
            {/* Navbar (no padding, full-width) */}
            <nav className="h-[50px] border-b flex items-center justify-between bg-white">
              {/* Hamburger button: shown on small screens */}
              <button
                className="sm:hidden inline-flex items-center justify-center p-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
              >
                <div className="border rounded-sm p-1">
                  <Menu className="w-5 h-5 text-black" />
                </div>
              </button>

              {/* 
                Optionally, you could place brand or user info on the right side:
                <div className="mr-4">Some Right-Aligned Item</div>
              */}
            </nav>

            {/* Page Content (with padding) */}
            <main className="flex-1 p-4 sm:p-10 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
