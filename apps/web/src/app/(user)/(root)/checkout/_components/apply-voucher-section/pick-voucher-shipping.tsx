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
import { LucideArrowRight, Trash2Icon, Truck } from 'lucide-react';
import { useState } from 'react';

export default function PickVoucherShipping() {
  const {
    inStockCartItems,
    applyVoucher,
    appliedVouchers,
    price,
    clearShippingVoucher,
    appliedShipping,
  } = useCheckout();

  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const selectedVoucher = appliedVouchers.find((v) => v.type === 'SHIPPING');

  const {
    data: vouchers,
    isPending,
    error,
  } = useQuery({
    queryKey: ['all:voucher', 'applicable:shipping', inStockCartItems],
    queryFn: async () => {
      const { data: shippingVouchers } =
        await apiclient.post<ApplicableVoucherResponse>(
          '/voucher/applicable/shipping',
          {
            subtotalShoppingPrice: price.subtotalProductBefore,
            subtotalShoppingDiscountPrice: price.subtotalDiscountProduct,
          },
        );

      return shippingVouchers;
    },
  });

  let sortedVouchers = vouchers
    ?.map((voucher) => {
      let voucherInPrice = voucher.value;
      if (voucher.valueType === 'PERCENTAGE') {
        voucherInPrice =
          (voucher.value / 100) * price.subtotalShippingCostBefore;
      }

      let voucherInPercent = voucher.value;
      if (voucher.valueType === 'FIXED_AMOUNT') {
        voucherInPercent =
          (voucher.value / price.subtotalShippingCostBefore) * 100;
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
              onClick={() => {
                if (!appliedShipping) return;
                setOpen(true);
              }}
              className={cn(
                'flex w-full h-full justify-between items-center text-sm border rounded-lg p-1 px-3 relative bg-neutral-100 border-neutral-300 cursor-pointer',
                !appliedShipping && 'cursor-not-allowed',
              )}
            >
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-neutral-700" />
                <div className="flex flex-col items-start text-neutral-600 font-medium">
                  <span className="line-clamp-1">Voucher Ongkir</span>
                  <span className="text-neutral-400 italic">
                    {appliedShipping
                      ? 'Tidak ada yang dipilih'
                      : 'Pilih pengiriman terlebih dahulu'}
                  </span>
                </div>
              </div>
              <LucideArrowRight className="shrink-0 text-neutral-700" />
            </div>
          ) : (
            <div
              onClick={() => setOpen(true)}
              className={cn(
                'flex w-full h-full justify-between items-center text-sm border rounded-lg p-1 px-3 relative cursor-pointer bg-green-100 border-green-300',
              )}
            >
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-600" />
                <div className="flex flex-col items-start text-green-600">
                  <span className="line-clamp-1 font-medium">
                    {selectedVoucher.name}
                  </span>
                  <span className="text-green-500 italic">
                    {(() => {
                      let voucherInPrice = selectedVoucher.value;
                      if (selectedVoucher.valueType === 'PERCENTAGE') {
                        voucherInPrice =
                          (selectedVoucher.value / 100) *
                          price.subtotalShippingCostBefore;
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
            onClick={() => clearShippingVoucher()}
            variant="outline"
            size={'sm'}
            className="w-full text-sm border-neutral-300 text-neutral-600 hover:text-neutral-600 hover:bg-neutral-100"
          >
            <Trash2Icon className="text-red-600" /> Cancel Voucher Ongkir
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn(
            'bg-neutral-800 border-neutral-500 text-neutral-200',
            visible && 'opacity-0',
          )}
        >
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
                      onClick={(e) => {
                        applyVoucher(voucher);
                        setOpen(false);
                      }}
                      key={voucher.id}
                      className="mb-6 cursor-pointer hover:shadow-lg hover:opacity-90"
                    >
                      <VoucherCard
                        onOpenChange={setVisible}
                        voucher={voucher}
                      />
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
