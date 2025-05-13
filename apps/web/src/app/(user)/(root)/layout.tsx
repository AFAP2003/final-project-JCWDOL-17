import Footer from '@/components/footer';
// import LocoScroll from '@/components/loco-scroll';
import Navbar from '@/components/navbar';
import PageWrapper from '@/components/page-wrapper';
import { CartProvider } from '@/context/cart-provider';
import { CheckoutProvider } from '@/context/checkout-provider';
import { LocationProvider } from '@/context/location-provider';
import { NavbarProvider } from '@/context/navbar-provider';
import { OrderProvider } from '@/context/order-provider';
import QueryProvider from '@/context/query-provider';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function UserLayout({ children }: Props) {
  return (
    <QueryProvider>
      <LocationProvider>
        <CartProvider>
          <NavbarProvider>
            <CheckoutProvider>
              <OrderProvider>
                {/* <LocoScroll> */}
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <PageWrapper>{children}</PageWrapper>
                  <Footer />
                </div>
                {/* </LocoScroll> */}
              </OrderProvider>
            </CheckoutProvider>
          </NavbarProvider>
        </CartProvider>
      </LocationProvider>
    </QueryProvider>
  );
}
