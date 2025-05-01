import Footer from '@/components/footer';
import LocoScroll from '@/components/loco-scroll';
import Navbar from '@/components/navbar';
import PageWrapper from '@/components/page-wrapper';
import { CurrentLocationProvider } from '@/context/current-location-provider';
import { NavbarProvider } from '@/context/navbar-provider';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function UserLayout({ children }: Props) {
  return (
    <CurrentLocationProvider>
      <NavbarProvider>
        <LocoScroll>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <PageWrapper>{children}</PageWrapper>
            <Footer />
          </div>
        </LocoScroll>
      </NavbarProvider>
    </CurrentLocationProvider>
  );
}
