'use client';

import PickVoucherShipping from './pick-voucher-shipping';
import PickVoucherShopping from './pick-voucher-shopping';

export default function ApplyVoucherSection() {
  return (
    <div className="p-4 rounded-lg border border-neutral-200 bg-white/80 space-y-3">
      <h4 className="text-base font-semibold text-neutral-700">
        Pakai Voucher
      </h4>
      <div className="space-y-6">
        <PickVoucherShopping />
        <PickVoucherShipping />
      </div>
    </div>
  );
}
