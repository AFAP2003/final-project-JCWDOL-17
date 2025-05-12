'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatCurrency } from '@/lib/utils';
import * as React from 'react';
import { PriceSlider } from './price-slider';

type Props = {
  minPrice?: number;
  maxPrice?: number;
  onChange?: (values: [number, number], includeAboveMax?: boolean) => void;
  step?: number;
};

export function PriceFilter({
  minPrice = 0,
  maxPrice = 10000000,
  step,
  onChange,
}: Props) {
  const [priceRange, setPriceRange] = React.useState<[number, number]>([
    minPrice,
    maxPrice,
  ]);
  const [includeAboveMax, setIncludeAboveMax] = React.useState(false);
  const [minInputValue, setMinInputValue] = React.useState(minPrice);
  const [maxInputValue, setMaxInputValue] = React.useState(maxPrice);

  // Format number to Indonesian Rupiah without currency symbol for input
  const formatRupiahForInput = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Parse Rupiah formatted string to number
  const parseRupiah = (value: string): number => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    return numericValue ? Number.parseInt(numericValue, 10) : 0;
  };

  const handlePriceChange = (values: number[]) => {
    const newRange = values as [number, number];
    setPriceRange(newRange);
    setMinInputValue(newRange[0]);
    setMaxInputValue(newRange[1]);
    onChange?.(newRange, includeAboveMax);
  };

  const handleIncludeAboveMaxChange = (checked: boolean) => {
    setIncludeAboveMax(checked);
    onChange?.(priceRange, checked);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseRupiah(e.target.value);

    // const parsedValue = parseRupiah(value);
    if (!isNaN(value)) {
      // Ensure min doesn't exceed max
      setMinInputValue(Number(value));
      const newMin = Math.min(value, priceRange[1]);
      setPriceRange([newMin, priceRange[1]]);
      onChange?.([newMin, priceRange[1]], includeAboveMax);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxInputValue(Number(value));

    const parsedValue = parseRupiah(value);
    if (!isNaN(parsedValue)) {
      // Ensure max isn't less than min
      const newMax = Math.max(parsedValue, priceRange[0]);
      setPriceRange([priceRange[0], newMax]);
      onChange?.([priceRange[0], newMax], includeAboveMax);
    }
  };

  // Format input on blur
  const handleMinInputBlur = () => {
    setMinInputValue(priceRange[0]);
  };

  const handleMaxInputBlur = () => {
    setMaxInputValue(priceRange[1]);
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center w-full">
        <h4 className="text-base font-medium tracking-tight text-neutral-800">
          Harga
        </h4>
        {/* {priceRange[0] !== minPrice &&  (
          <div
            onClick={() => {
              setIsProcessing(true);
              setSelectedCategories([]);
            }}
            className="flex items-center gap-0.5 text-xs cursor-pointer p-1 hover:rounded-xl hover:bg-neutral-200 transition-all duration-200"
          >
            <X className="text-red-500 size-4" />
            <span className="text-neutral-500">Clear</span>
          </div>
        )} */}
      </div>
      <div className="space-y-6 px-2">
        <div
          className={cn(includeAboveMax && 'opacity-70 pointer-events-none')}
        >
          <div className="">
            <PriceSlider
              value={priceRange}
              min={minPrice}
              max={maxPrice}
              step={step || 50000}
              onValueChange={handlePriceChange}
              className="my-6"
            />
          </div>

          <div className="flex flex-col items-center justify-between gap-2">
            <div className="grid grid-cols-[15%_85%] gap-2 items-center">
              <div>Min.</div>
              <div className="relative">
                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-neutral-700 text-sm">
                  Rp
                </div>
                <Input
                  value={minInputValue}
                  onChange={handleMinInputChange}
                  onBlur={handleMinInputBlur}
                  className="pl-8 sm:text-sm text-sm"
                  placeholder=""
                />
              </div>
            </div>
            <div className="grid grid-cols-[15%_85%] gap-2 items-center">
              <div>Max.</div>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-neutral-700">
                  Rp
                </div>
                <Input
                  value={formatRupiahForInput(
                    maxInputValue > maxPrice ? maxPrice : maxInputValue,
                  )}
                  onChange={handleMaxInputChange}
                  onBlur={handleMaxInputBlur}
                  className="pl-8"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-above-max"
            checked={includeAboveMax}
            onCheckedChange={handleIncludeAboveMaxChange}
          />
          <Label htmlFor="include-above-max" className="text-sm">
            Termasuk produk di atas {formatCurrency(maxPrice)}
          </Label>
        </div>
      </div>
    </div>
  );
}
