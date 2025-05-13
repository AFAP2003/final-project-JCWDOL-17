import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { FilterIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';
import { useEffect, useState } from 'react';

const safeSelect = ['refferal', 'product-specific', 'shipping', 'all'] as const;

type Props = {
  type?: string;
};

export default function FilterType({ type }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filterType, setFilterType] = useState<
    'refferal' | 'product-specific' | 'shipping' | 'all'
  >(() => {
    const ok = safeSelect.includes(type as any);
    if (ok) return type as any;
    return 'all';
  });

  useEffect(() => {
    const param = qs.parse(searchParams.toString());
    param['type'] = filterType === 'all' ? null : filterType;
    param['page'] = `1`;
    const query = qs.stringify(param, {
      skipEmptyString: true,
      skipNull: true,
    });
    router.push(`/user/my-vouchers?${query}`);
  }, [filterType]);

  return (
    <Select
      value={filterType as any}
      onValueChange={(value) => setFilterType(value as any)}
    >
      <SelectTrigger
        id="BBBBB"
        chevronClass="text-black font-medium shrink-0 ml-2"
        className={cn(
          'w-auto border-none shadow-none focus:ring-0',
          !filterType && 'w-[130px]',
        )}
      >
        {!filterType ? (
          <div className="text-neutral-700 font-medium flex items-center w-full justify-end gap-2 mr-2">
            <FilterIcon className="size-5 text-neutral-500" />
            <div>Pilih Type</div>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-auto !last:text-red-500">
            <FilterIcon className="size-5 text-neutral-500" />
            <div className="text-gray-700">
              {(() => {
                let label = '';
                switch (filterType) {
                  case 'refferal':
                    label = 'Voucher Referral';
                    break;
                  case 'product-specific':
                    label = 'Voucher Produk';
                    break;
                  case 'shipping':
                    label = 'Voucher Ongkir';
                    break;
                  case 'all':
                    label = 'All Voucher';
                    break;
                }
                return label;
              })()}
            </div>
          </div>
        )}
      </SelectTrigger>
      <SelectContent>
        {safeSelect.map((item, idx) => {
          let label = '';
          switch (item) {
            case 'refferal':
              label = 'Voucher Referral';
              break;
            case 'product-specific':
              label = 'Voucher Produk';
              break;
            case 'shipping':
              label = 'Voucher Ongkir';
              break;
            case 'all':
              label = 'All Voucher';
              break;
          }

          return (
            <SelectItem
              key={idx}
              value={item}
              onSelect={() => setFilterType(item)}
              className="text-neutral-700"
            >
              {label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
