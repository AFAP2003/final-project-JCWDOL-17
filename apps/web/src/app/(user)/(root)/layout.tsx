import Navbar from '@/components/navbar';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function UserLayout({ children }: Props) {
  return (
    <div>
      <Navbar />
      <div>{children}</div>
      [FOOTER]
    </div>
  );
}
