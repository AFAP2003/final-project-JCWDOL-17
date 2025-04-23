import Navbar from '@/components/navbar';
import { CurrentLocationProvider } from '@/context/current-location-provider';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function UserLayout({ children }: Props) {
  return (
    <CurrentLocationProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="grow flex flex-col">{children}</div>
        <div>[FOOTER]</div>
      </div>
    </CurrentLocationProvider>
  );
}
