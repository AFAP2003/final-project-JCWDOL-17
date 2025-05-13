import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Info, Percent, ShoppingBag, TimerIcon, Truck } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const typeColorMap: Record<Props['voucher']['type'], string> = {
  PRODUCT_SPECIFIC: 'bg-orange-500',
  REFERRAL: 'bg-red-500',
  SHIPPING: 'bg-green-500',
};

// Type icon mapping
const typeIconMap: Record<Props['voucher']['type'], React.ReactNode> = {
  PRODUCT_SPECIFIC: <ShoppingBag size={18} />,
  SHIPPING: <Truck size={18} />,
  REFERRAL: <Percent size={18} />,
};

// Type label mapping
const typeLabelMap: Record<Props['voucher']['type'], string> = {
  PRODUCT_SPECIFIC: 'PRODUCTS',
  SHIPPING: 'SHIPPING',
  REFERRAL: 'REFERRAL',
};

const formatValue = (
  value: number,
  valueType: 'FIXED_AMOUNT' | 'PERCENTAGE',
): string => {
  if (valueType === 'PERCENTAGE') {
    return `${value}%`;
  }
  return `$${value.toFixed(2)}`;
};

type Props = {
  voucher: {
    id: string;
    code: string;
    name: string;
    description?: string;
    type: 'PRODUCT_SPECIFIC' | 'SHIPPING' | 'REFERRAL';
    valueType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: number;
    minPurchase?: number;
    maxDiscount?: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    isForShipping: boolean;
    maxUsage?: number;
    usageCount: number;
    createdAt: string;
    products: { id: string }[];
    users: { id: string }[];
    // voucherInPrice: number;
    // voucherInPercent: string;
  };
  onOpenChange?: (value: boolean) => void;
};

const VoucherCard: React.FC<Props> = ({ voucher, onOpenChange }) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(open);
    }
  }, [open]);
  return (
    <div className="flex flex-row w-full overflow-hidden rounded-lg shadow-sm relative border border-neutral-300">
      {/* Left color bar with icon */}
      <div
        className={`${typeColorMap[voucher.type]} w-20 h-auto flex flex-col items-center justify-center text-neutral-200 py-2 sm:py-4 shrink-0`}
      >
        <div className="mr-2 sm:mr-0 sm:mb-2">{typeIconMap[voucher.type]}</div>
        <div className="text-[10px] sm:text-xs font-semibold text-center px-1 sm:px-2 whitespace-pre-wrap">
          {typeLabelMap[voucher.type]}
        </div>
      </div>

      {/* Perforated edge for desktop (vertical) */}
      <div className="absolute -left-[2px] top-0 bottom-0 flex flex-col justify-between py-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-background" />
        ))}
      </div>

      {/* Voucher content */}
      <div className="flex-1 flex flex-col p-3 px-4 bg-neutral-50">
        <div className="flex items-center">
          <span
            className={`font-bold text-sm sm:text-base ${isMobile ? 'flex flex-col items-start' : 'flex items-center'}`}
          >
            <span>{voucher.name}</span>
          </span>
        </div>

        <div className="text-xs sm:text-sm text-red-500 mt-1 italic flex items-center truncate gap-1">
          {(() => {
            switch (voucher.valueType) {
              case 'PERCENTAGE':
                return `${voucher.value}% s/d ${formatCurrency(voucher.maxDiscount || 0)}`;
              case 'FIXED_AMOUNT':
                return `${formatCurrency(voucher.value)} Off`;
            }
          })()}
        </div>

        {/* Perforated edge on the right (desktop and mobile) - fixed to be visible in all layouts */}
        <div className="absolute -right-2 top-0 bottom-0 flex flex-col justify-between py-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-background" />
          ))}
        </div>

        {/* Conditions section */}
        <div className="mt-2 sm:mt-3 flex justify-between items-center">
          <div>
            {/* Min purchase if available */}
            {voucher.minPurchase && (
              <div className="text-[10px] sm:text-xs text-neutral-500 truncate">
                Min. Order: {formatCurrency(voucher.minPurchase)}
              </div>
            )}
            {/* Validity period */}
            <div className="text-[10px] sm:text-xs text-neutral-500 mt-2 flex flex-wrap items-center">
              <span className="mr-1">
                {format(voucher.endDate, 'dd MMMM, yyyy')}
              </span>
              <TimerIcon size={12} className="flex-shrink-0" />
            </div>
          </div>

          {/* Terms & Conditions / Details dialog */}
          <Dialog open={open} onOpenChange={setOpen} modal={false}>
            <DialogTrigger asChild>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(true);
                }}
                variant="ghost"
                size="sm"
                className="text-[10px] sm:text-xs flex items-center p-0 hover:bg-transparent text-neutral-700 hover:text-neutral-700/90"
              >
                <Info size={12} className="text-voucher-blue" />
                <span className="text-voucher-blue underline">S&K</span>
              </Button>
            </DialogTrigger>
            <DialogContent
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="bg-neutral-800 text-neutral-200 border-neutral-400"
            >
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-lg sm:text-xl">
                  Syarat & Ketentuan
                </DialogTitle>
                <DialogDescription className="text-sm text-neutral-300">
                  {voucher.name} | {voucher.code}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-2">
                <div>
                  <h3 className="font-semibold">Deskripsi</h3>
                  <p className="text-sm mt-1 text-neutral-300">
                    {voucher.description || 'No description available.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold">Value Type</h3>
                    <p className="text-sm mt-1 text-neutral-300">
                      {voucher.valueType.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Value</h3>
                    <p className="text-sm mt-1 font-medium text-neutral-300">
                      {formatValue(voucher.value, voucher.valueType)}
                    </p>
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold">Start Date</h3>
                    <p className="text-sm mt-1 text-neutral-300">
                      {format(voucher.startDate, 'dd MMMM, yyyy')}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">End Date</h3>
                    <p className="text-sm mt-1 text-neutral-300">
                      {format(voucher.endDate, 'dd MMMM, yyyy')}
                    </p>
                  </div>
                </div>

                {(voucher.minPurchase || voucher.maxDiscount) && (
                  <>
                    <Separator className="my-2" />

                    <div className="grid grid-cols-2 gap-6">
                      {voucher.minPurchase && (
                        <div>
                          <h3 className="font-semibold">Minimum Pembelian</h3>
                          <p className="text-sm mt-1 text-neutral-300">
                            {formatCurrency(voucher.minPurchase)}
                          </p>
                        </div>
                      )}

                      {voucher.maxDiscount && (
                        <div>
                          <h3 className="font-semibold">Maximum Potongan</h3>
                          <p className="text-sm mt-1 text-neutral-300">
                            {formatCurrency(voucher.maxDiscount)}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default VoucherCard;
