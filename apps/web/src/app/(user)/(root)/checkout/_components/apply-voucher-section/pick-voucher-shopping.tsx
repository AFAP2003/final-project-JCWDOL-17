import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import VoucherCard from '@/components/voucher-card';
import { useCheckout } from '@/context/checkout-provider';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { ApplicableVoucherResponse } from '@/lib/types/applicable-voucher-response';
import { cn, formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { LucideArrowRight, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { LiaShoppingBagSolid } from 'react-icons/lia';
export default function PickVoucherShopping() {
  const {
    inStockCartItems,
    applyVoucher,
    appliedVouchers,
    price,
    appliedProductDiscounts,
    clearShoppingVoucher,
  } = useCheckout();
  const priceAfterDiscountProduct =
    price.subtotalProductBefore - price.subtotalDiscountProduct;

  const [open, setOpen] = useState(false);
  const selectedVoucher = appliedVouchers.find((v) => v.type !== 'SHIPPING');

  const {
    data: vouchers,
    isPending,
    error,
  } = useQuery({
    queryKey: ['all:voucher', 'applicable:shopping', inStockCartItems],
    queryFn: async () => {
      const { data: shoppingVouchers } =
        await apiclient.post<ApplicableVoucherResponse>(
          '/voucher/applicable/shopping',
          {
            cartItems: inStockCartItems.map((item) => {
              const discount = appliedProductDiscounts.find(
                (pd) => pd.itemId === item.id,
              );
              return {
                id: item.id,
                productId: item.productId,
                discountPrice: discount?.discountInPrice || 0,
                subtotalPrice: item.quantity * item.product.price,
              };
            }),
            subtotalShoppingPrice: price.subtotalProductBefore,
            subtotalShoppingDiscountPrice: price.subtotalDiscountProduct,
          },
        );

      return shoppingVouchers;
    },
  });

  let sortedVouchers = vouchers
    ?.map((voucher) => {
      let voucherInPrice = voucher.value;
      if (voucher.valueType === 'PERCENTAGE') {
        voucherInPrice = (voucher.value / 100) * priceAfterDiscountProduct;
      }

      let voucherInPercent = voucher.value;
      if (voucher.valueType === 'FIXED_AMOUNT') {
        voucherInPercent = (voucher.value / priceAfterDiscountProduct) * 100;
      }

      return {
        ...voucher,
        voucherInPrice: voucherInPrice,
        voucherInPercent: voucherInPercent.toFixed(2),
      };
    })
    .sort((a, b) => b.voucherInPrice - a.voucherInPrice);

  if (error) {
    toast({
      description:
        'Sorry we have problem in our server, please try again later',
      variant: 'destructive',
    });
  }

  return (
    <>
      <div className="space-y-2">
        <div className="w-full p-3 rounded-lg border border-neutral-300 bg-white/80 relative">
          {!selectedVoucher ? (
            <div
              onClick={() => setOpen(true)}
              className={cn(
                'flex w-full h-full justify-between items-center text-sm border rounded-lg p-1 px-3 relative bg-neutral-100 border-neutral-300 cursor-pointer',
              )}
            >
              <div className="flex items-center gap-2">
                <LiaShoppingBagSolid className="w-5 h-5 text-neutral-700" />
                <div className="flex flex-col items-start text-neutral-600 font-medium">
                  <span className="line-clamp-1">Voucher Belanja</span>
                  <span className="text-neutral-400 italic">
                    Tidak ada yang dipilih
                  </span>
                </div>
              </div>
              <LucideArrowRight className="shrink-0 text-neutral-700" />
            </div>
          ) : (
            <div
              onClick={() => setOpen(true)}
              className={cn(
                'flex w-full h-full justify-between items-center text-sm border rounded-lg p-1 px-3 relative cursor-pointer',
                selectedVoucher.type === 'PRODUCT_SPECIFIC' &&
                  'bg-orange-100 border-orange-300',
                selectedVoucher.type === 'REFERRAL' &&
                  'bg-red-100 border-red-300',
              )}
            >
              <div className="flex items-center gap-2">
                <LiaShoppingBagSolid className="w-5 h-5 text-red-600" />
                <div className="flex flex-col items-start text-red-600">
                  <span className="line-clamp-1 font-medium">
                    {selectedVoucher.name}
                  </span>
                  <span className="text-red-500 italic">
                    {(() => {
                      let voucherInPrice = selectedVoucher.value;
                      if (selectedVoucher.valueType === 'PERCENTAGE') {
                        voucherInPrice =
                          (selectedVoucher.value / 100) *
                          priceAfterDiscountProduct;
                      }
                      return `${formatCurrency(voucherInPrice)}`;
                    })()}
                  </span>
                </div>
              </div>
              <LucideArrowRight className="shrink-0" />
            </div>
          )}
        </div>

        {selectedVoucher && (
          <Button
            onClick={() => clearShoppingVoucher()}
            variant="outline"
            size={'sm'}
            className="w-full text-sm border-neutral-300 text-neutral-600 hover:text-neutral-600 hover:bg-neutral-100"
          >
            <Trash2Icon className="text-red-600" /> Cancel Voucher Belanja
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-neutral-800 border-neutral-500 text-neutral-200">
          <DialogTitle className="hidden" />
          <DialogDescription className="hidden" />

          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Pilih Voucher
            </h3>

            <Separator className="bg-neutral-500 my-6" />

            {sortedVouchers?.length ? (
              <ScrollArea id="prevent-lenis" className="h-[462px]">
                {sortedVouchers.map((voucher) => {
                  return (
                    <div
                      onClick={() => {
                        applyVoucher(voucher);
                        setOpen(false);
                      }}
                      key={voucher.id}
                      className="mb-6 cursor-pointer hover:shadow-lg hover:opacity-90"
                    >
                      <VoucherCard voucher={voucher} />
                    </div>
                  );
                })}
              </ScrollArea>
            ) : (
              <div className="text-base text-neutral-400 italic">
                Tidak ada voucher yang bisa dipakai
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
