'use client';

import { useCheckout } from '@/context/checkout-provider';
import CheckoutContent from './_components/checkout-content';
import DialogInfo from './_components/modal-info';
import Preparing from './_components/preparing';

export default function CheckoutPage() {
  const { isPreparing, prepareError } = useCheckout();

  return (
    <div>
      {(function () {
        if (isPreparing) {
          return <Preparing />;
        }
        if (!isPreparing && !prepareError) {
          return <CheckoutContent />;
        }
      })()}

      <DialogInfo error={prepareError} />
    </div>
  );
}
