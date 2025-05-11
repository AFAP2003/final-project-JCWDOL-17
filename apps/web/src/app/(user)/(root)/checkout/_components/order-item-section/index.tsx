'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCheckout } from '@/context/checkout-provider';
import { formatCurrency } from '@/lib/utils';
import { Check, Package, X } from 'lucide-react';
import Image from 'next/image';

export default function OrderItemSection() {
  const { inStockCartItems, outStockCartItems, appliedProductDiscounts } =
    useCheckout();

  return (
    <Card className="bg-neutral-50 border-neutral-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-neutral-700">
          <Package className="w-5 h-5 inline-block mr-2 text-neutral-600" />
          Pesanan Anda
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* In Stock Items */}
        {inStockCartItems.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center text-neutral-700">
              <Check className="w-4 h-4 mr-1 text-green-500" />
              Tersedia ({inStockCartItems.length})
            </h4>
            {inStockCartItems.map((item) => {
              const promo = appliedProductDiscounts.find(
                (promo) => promo.itemId === item.id,
              );

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-lg bg-white/80 border border-neutral-200"
                >
                  <div className="flex items-start space-x-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-neutral-100 flex-shrink-0">
                      <Image
                        src={
                          item.product.images[0]?.imageUrl ||
                          '/placeholder.svg?height=64&width=64'
                        }
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-neutral-700 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                        {item.product.description}
                      </p>
                      <div className="flex items-center mt-2 text-sm">
                        <span className="text-neutral-600">
                          Qty: {item.quantity}
                        </span>
                        <span className="mx-2 text-neutral-300">|</span>
                        <span className="text-neutral-600">
                          {item.product.weight} kg
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-700">
                        {formatCurrency(item.product.price)}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  {/* Promo and Subtotal */}
                  <div className="space-y-1">
                    {promo && (
                      <div className="flex justify-between text-sm font-medium text-red-600">
                        <span>Diskon</span>
                        {promo.discount.type !== 'BUY_X_GET_Y' && (
                          <span>
                            (-) {formatCurrency(promo.discountInPrice!)}
                          </span>
                        )}
                        {promo.discount.type === 'BUY_X_GET_Y' && (
                          <span>(+) {promo.discount.getQuantity} Item</span>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-medium text-neutral-700">
                      <span>Subtotal</span>
                      <span>
                        {formatCurrency(
                          item.product.price * item.quantity -
                            (promo?.discountInPrice || 0),
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Out of Stock Items */}
        {outStockCartItems.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center text-neutral-700">
              <X className="w-4 h-4 mr-1 text-red-500" />
              Tidak Tersedia ({outStockCartItems.length})
            </h4>
            {outStockCartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start space-x-4 p-4 rounded-lg bg-neutral-100 border border-neutral-200"
              >
                <div className="relative h-16 w-16 rounded-md overflow-hidden bg-neutral-200 flex-shrink-0">
                  <Image
                    src={
                      item.product.images[0]?.imageUrl ||
                      '/placeholder.svg?height=64&width=64'
                    }
                    alt={item.product.name}
                    fill
                    className="object-cover opacity-50"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-neutral-500 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-sm text-neutral-400 mt-1 line-clamp-2">
                    {item.product.description}
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-neutral-500">
                      Qty: {item.quantity}
                    </span>
                    <span className="mx-2 text-neutral-300">|</span>
                    <span className="text-neutral-500">
                      {item.product.weight} kg
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-500 line-through">
                    Rp {Number(item.product.price).toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-red-500 mt-1">Stok Habis</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
