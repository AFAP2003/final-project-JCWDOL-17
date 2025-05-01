'use client';

import { cn } from '@/lib/utils';
import {
  Facebook,
  Headphones,
  Instagram,
  Linkedin,
  Twitter,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  // const { isFullNavbar } = useNavbar();

  return (
    <footer
      className={cn(
        'relative translate-y-[220px] transition-all duration-500 bg-neutral-800 text-neutral-200 max-xl:px-6 pb-6 pt-12',
        // isFullNavbar && 'translate-y-[220px]',
      )}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Headphones className="text-neutral-100" size={24} />
              <span className="text-xl font-medium">91 2345 678</span>
            </div>
            <p className="text-sm text-neutral-300">Call our Hotline 24/7</p>
            <div className="text-sm text-neutral-300 space-y-1">
              <p>Jl. Jendral Sudirman No. 45,</p>
              <p>Kebayoran Baru, Jakarta Selatan 12190</p>
              <p>Indonesia</p>
            </div>
            <p className="text-sm text-neutral-300">support@Gogrocery.com</p>

            {/* Social Media Icons */}
            <div className="flex gap-3 pt-2">
              <Link
                href="#"
                className="hover:bg-neutral-600 bg-neutral-700 p-2 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} className="" />
              </Link>
              <Link
                href="#"
                className="hover:bg-neutral-600 bg-neutral-700 p-2 rounded-full transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} className="" />
              </Link>
              <Link
                href="#"
                className="hover:bg-neutral-600 bg-neutral-700 p-2 rounded-full transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} className="" />
              </Link>
              <Link
                href="#"
                className="hover:bg-neutral-600 bg-neutral-700 p-2 rounded-full transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </Link>
            </div>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-white lg:text-center">
              Resources
            </h3>
            <ul className="space-y-3 lg:text-center">
              {['About Us', 'Shop', 'Cart', 'Brands', 'Mobile App'].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-neutral-300 hover:text-white text-sm transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-white lg:text-center">
              Support
            </h3>
            <ul className="space-y-3 lg:text-center">
              {[
                'Reviews',
                'Contact',
                'Return Policy',
                'Online Support',
                'Money Back',
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-neutral-300 hover:text-white text-sm transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Store Info Column */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-white lg:text-right">
              Store Info
            </h3>
            <ul className="space-y-3 lg:text-right">
              {[
                'Best Seller',
                'Top Sold Items',
                'New Arrivals',
                'Flash Sale',
                'Discount Products',
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-neutral-300 hover:text-white text-sm transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-700 my-8 w-full" />

        {/* Logo and Copyright Section */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative w-32 h-16 mb-3">
            <Image
              src={'/images/app-logo-white.png'}
              alt="Gogrocery Logo"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-sm text-neutral-400">
            Copyright © 2025 Gogrocery, Inc. All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
