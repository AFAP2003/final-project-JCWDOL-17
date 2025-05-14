'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';
import { useEffect, useState } from 'react';

type Props = {
  promo?: string;
};

const promos = ['no-rules', 'max-price', 'bogo'] as const;

export default function PromoFilter({ promo }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPromos, setSelectedPromos] = useState(
    promo?.trim().split(',') || [],
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const param = qs.parse(searchParams.toString());
    param['promo'] = selectedPromos.join(',');
    const query = qs.stringify(param, {
      skipEmptyString: true,
      skipNull: true,
    });
    setIsProcessing(false);
    router.push(`/search?${query}`);
  }, [selectedPromos]);

  return (
    <div>
      <div className="mb-4 flex justify-between items-center w-full">
        <h4 className="text-base font-medium tracking-tight text-neutral-200">
          Promo
        </h4>
        {selectedPromos.length > 0 && (
          <div
            onClick={() => {
              setIsProcessing(true);
              setSelectedPromos([]);
            }}
            className="flex items-center gap-0.5 text-xs cursor-pointer p-1 px-2 rounded-xl hover:bg-neutral-200 hover:text-neutral-700 text-neutral-200 transition-all duration-200"
          >
            <X className="text-red-500 size-4" />
            <span>Clear</span>
          </div>
        )}
      </div>
      <ScrollArea className="w-full max-h-[270px] pr-2">
        <div className="space-y-1.5">
          {promos.map((promo, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-neutral-200/90 transition-colors group"
              title={promo}
            >
              <Checkbox
                id={promo}
                className="bg-neutral-200 border border-neutral-600"
                checked={selectedPromos.includes(promo)}
                disabled={isProcessing}
                onCheckedChange={(checked) => {
                  setIsProcessing(true);
                  if (checked) {
                    setSelectedPromos((prev) => [...prev, promo]);
                  } else {
                    setSelectedPromos((prev) =>
                      prev.filter((c) => c !== promo),
                    );
                  }
                }}
              />
              <Label
                htmlFor={promo}
                className="text-sm font-medium leading-none truncate max-w-[180px] group-hover:text-primary"
              >
                {(() => {
                  switch (promo) {
                    case 'bogo':
                      return 'Buy 1 Get 1';
                    case 'no-rules':
                      return 'Flash Deal';
                    case 'max-price':
                      return 'Special Offer';
                  }
                })()}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
