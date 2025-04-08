import Navbar from '@/components/navbar';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function UserLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="grow flex flex-col">{children}</div>
      <div>[FOOTER]</div>
    </div>
  );
}
