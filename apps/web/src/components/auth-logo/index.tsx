'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
type Props = {};

export default function AuthLogo({}: Props) {
  const router = useRouter();
  return (
    <div className="relative -left-6 flex items-center justify-start">
      <div
        onClick={() => router.push('/')}
        className={cn(
          'relative w-40 h-20 transition-all duration-500 cursor-pointer',
          // isFullNavbar && '-translate-y-[400%]',
        )}
      >
        <Image src={'/images/app-logo-black.png'} alt="App Logo" fill />
      </div>
    </div>
  );
}
