'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatCurrency } from '@/lib/utils';
import { X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';
import { useEffect, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import { PriceSlider } from './price-slider';

type FilterProps = {
  initial?: { range: [number, number]; aboveMax: boolean };
  minPrice?: number;
  maxPrice?: number;
  step?: number;
  onChange?: (values: [number, number], includeAboveMax?: boolean) => void;
};

function Filter({
  minPrice = 0,
  maxPrice = 1000000,
  step = 50000,
  onChange,
  initial,
}: FilterProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initial ? initial.range[0] : minPrice,
    initial ? initial.range[1] : maxPrice,
  ]);
  const [includeAboveMax, setIncludeAboveMax] = useState(
    initial ? initial.aboveMax : false,
  );
  const [minInputValue, setMinInputValue] = useState(
    initial ? initial.range[0] : minPrice,
  );
  const [maxInputValue, setMaxInputValue] = useState(
    initial ? initial.range[1] : maxPrice,
  );

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

    if (!isNaN(value)) {
      // Ensure min doesn't exceed max
      let newMin = Math.min(value, priceRange[1]);
      newMin = Math.max(newMin, minPrice);
      setMinInputValue(newMin);
      setPriceRange([newMin, priceRange[1]]);
      onChange?.([newMin, priceRange[1]], includeAboveMax);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseRupiah(e.target.value);

    if (!isNaN(value)) {
      // Ensure max isn't less than min
      let newMax = Math.max(value, priceRange[0]);
      newMax = Math.min(newMax, maxPrice);
      setMaxInputValue(newMax);
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
      <div className="mb-4 flex justify-between items-center w-full pt-3">
        <h4 className="text-base font-medium tracking-tight text-neutral-200">
          Harga
        </h4>
        {(minInputValue !== minPrice ||
          maxInputValue !== maxPrice ||
          includeAboveMax === true) && (
          <div
            onClick={() => {
              setMinInputValue(minPrice);
              setMaxInputValue(maxPrice);
              setPriceRange([minPrice, maxPrice]);
              setIncludeAboveMax(false);
              onChange?.([minPrice, maxPrice], false);
            }}
            className="flex items-center gap-0.5 text-xs cursor-pointer p-1 px-2 rounded-xl hover:bg-neutral-200 hover:text-neutral-700 text-neutral-200 transition-all duration-200"
          >
            <X className="text-red-500 size-4" />
            <span className="text-neutral-500">Clear</span>
          </div>
        )}
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
              step={step}
              onValueChange={handlePriceChange}
              className="my-6"
            />
          </div>

          <div className="flex flex-col items-center justify-between gap-2">
            <div className="grid grid-cols-[15%_85%] gap-2 items-center w-full">
              <div>Min.</div>
              <div className="relative">
                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-neutral-300 text-sm">
                  Rp
                </div>
                <Input
                  value={formatRupiahForInput(minInputValue)}
                  onChange={handleMinInputChange}
                  onBlur={handleMinInputBlur}
                  className="pl-8 sm:text-sm text-sm"
                  placeholder=""
                />
              </div>
            </div>
            <div className="grid grid-cols-[15%_85%] gap-2 items-center w-full">
              <div>Max.</div>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-neutral-300">
                  Rp
                </div>
                <Input
                  value={formatRupiahForInput(maxInputValue)}
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
            className="bg-neutral-200 border border-neutral-600"
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

type PriceFilterProps = {
  price?: string;
};

export default function PriceFilter({ price }: PriceFilterProps) {
  const maxPrice = 500000;
  const minPrice = 0;

  const initialValue = (() => {
    let minVal = minPrice;
    let maxVal = maxPrice;
    if (!price) {
      return {
        range: [minVal, maxVal] as [number, number],
        aboveMax: false,
      };
    }

    const parts = price?.split(',');
    if (parts.length === 1) {
      const minValPart = Number(parts?.at(0));
      if (minValPart >= maxPrice) {
        return {
          range: [minVal, maxVal] as [number, number],
          aboveMax: true,
        };
      }
    }

    const minValPart = Number(parts?.at(0));
    if (!isNaN(minValPart)) {
      minVal = minValPart;
    }

    const maxValParts = Number(parts?.at(1));
    if (!isNaN(maxValParts)) {
      maxVal = maxValParts;
    }

    maxVal = Math.max(minVal, maxVal);
    minVal = Math.min(minVal, maxVal);

    return {
      range: [minVal, maxVal] as [number, number],
      aboveMax: false,
    };
  })();

  const router = useRouter();
  const searchParams = useSearchParams();
  const [priceRange, setPriceRange] = useState<[number, number]>(
    initialValue.range,
  );
  const [aboveMax, setAboveMax] = useState(initialValue.aboveMax);

  const [dbPriceRange] = useDebounceValue(priceRange, 500);
  // const [dbPriceRange] = useDebounceValue(abo, 500);

  useEffect(() => {
    const param = qs.parse(searchParams.toString());

    if (!aboveMax && dbPriceRange[0] === 0 && dbPriceRange[1] === maxPrice) {
      param['price'] = '';
    } else if (aboveMax) {
      param['price'] = `${maxPrice}`;
    } else {
      param['price'] = `${dbPriceRange.at(0)},${dbPriceRange.at(1)}`;
    }
    const query = qs.stringify(param, {
      skipEmptyString: true,
      skipNull: true,
    });
    router.push(`/search?${query}`, {
      scroll: false,
    });
  }, [dbPriceRange, aboveMax]);

  return (
    <Filter
      maxPrice={maxPrice}
      minPrice={minPrice}
      step={10000}
      initial={initialValue}
      onChange={(values, includeAboveMax) => {
        setPriceRange(values);
        setAboveMax(includeAboveMax || false);
      }}
    />
  );
}
