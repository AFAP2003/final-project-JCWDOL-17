'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCheckout } from '@/context/checkout-provider';
import { formatCurrency } from '@/lib/utils';

export default function PaymentSection() {
  const { price } = useCheckout();

  return (
    <Card className="bg-neutral-50 border-neutral-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-neutral-700">
          Ringkasan Pesanan
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Belanja Group */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-neutral-600">Belanja</div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Subtotal</span>
            <span className="font-medium text-neutral-700">
              {formatCurrency(price.subtotalProductBefore)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Diskon Produk</span>
            <span className="font-medium text-neutral-700">
              {formatCurrency(price.subtotalDiscountProduct)}
            </span>
          </div>
          {price.subtotalVoucherShopping > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Diskon Voucher</span>
              <span className="font-medium text-neutral-700">
                {formatCurrency(price.subtotalVoucherShopping)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Total</span>
            <span className="font-medium text-neutral-700">
              {formatCurrency(price.subtotalProductAfter)}
            </span>
          </div>
        </div>

        <Separator className="bg-neutral-200" />

        {/* Pengiriman Group */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-neutral-600">
            Pengiriman
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Subtotal</span>
            <span className="font-medium text-neutral-700">
              {formatCurrency(price.subtotalShippingCostBefore)}
            </span>
          </div>
          {price.subtotalVoucherShipping > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Diskon Voucher</span>
              <span className="font-medium text-neutral-700">
                {formatCurrency(price.subtotalVoucherShipping)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Total</span>
            <span className="font-medium text-neutral-700">
              {formatCurrency(price.subtotalShippingCostAfter)}
            </span>
          </div>
        </div>

        <Separator className="bg-neutral-200" />

        {/* Total Keseluruhan */}
        <div className="flex justify-between items-center">
          <span className="font-medium text-neutral-700">Total</span>
          <span className="font-bold text-lg text-neutral-700">
            {formatCurrency(price.totalAllCost)}
          </span>
        </div>

        {/* Tombol dan Catatan */}
        <div className="pt-4">
          <Button className="w-full py-6 bg-neutral-800 hover:bg-neutral-800/95 text-white">
            Selesaikan Pembayaran
          </Button>
        </div>
        <div className="text-xs text-neutral-500 text-center pt-2">
          Dengan melanjutkan, Anda menyetujui Syarat dan Ketentuan serta
          Kebijakan Privasi kami.
        </div>
      </CardContent>
    </Card>
  );
}
