'use client';

import MaxWidthWrapper from '@/components/max-width-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCheckout } from '@/context/checkout-provider';
import { Store } from 'lucide-react';
import ApplyVoucherSection from '../apply-voucher-section';
import DestinationSection from '../destination-section';
import NoteSection from '../note-section';
import OrderItemSection from '../order-item-section';
import PaymentSection from '../payment-section';
import ShippingSection from '../shipping-section';

export default function CheckoutContent() {
  const { store } = useCheckout();

  return (
    <MaxWidthWrapper className="">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Store Information */}
          <Card className="bg-neutral-50 border-neutral-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-neutral-700">
                <Store className="w-5 h-5 inline-block mr-2 text-neutral-600" />
                Diantar Dari
              </CardTitle>
            </CardHeader>
            <CardContent className="text-neutral-500">
              <h3 className="text-base font-medium text-neutral-700">
                {store.name}
              </h3>
              <div className="text-sm">
                {store.address}, {store.city}, {store.province}{' '}
                {store.postalCode}
              </div>
            </CardContent>
          </Card>

          {/* Destination */}
          <DestinationSection />

          {/* Order Items */}
          <OrderItemSection />

          {/* Note Section */}
          <NoteSection />

          {/* Shipping Method */}
          <ShippingSection />
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          {/* Customer Support */}
          <div className="mb-6">
            <ApplyVoucherSection />
          </div>
          <div className="sticky -top-24">
            {/* Payment */}
            <PaymentSection />
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
