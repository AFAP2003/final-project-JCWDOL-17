import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ArrowDownNarrowWide } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';
import { useEffect, useState } from 'react';

const safeSelect = ['createdAt', '-createdAt', 'price', '-price'] as const;

type Props = {
  orderBy?: string;
};

export default function OrderBy(props: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderBy, setOrderBy] = useState<
    'createdAt' | '-createdAt' | 'price' | '-price' | null
  >(() => {
    const ok = safeSelect.includes(props.orderBy as any);
    if (ok) return props.orderBy as any;
    return null;
  });

  useEffect(() => {
    const param = qs.parse(searchParams.toString());
    param['orderBy'] = orderBy;
    const query = qs.stringify(param, {
      skipEmptyString: true,
      skipNull: true,
    });
    router.push(`/search?${query}`);
  }, [orderBy]);

  return (
    <Select
      value={orderBy as any}
      onValueChange={(value) => setOrderBy(value as any)}
    >
      <SelectTrigger
        chevronClass="text-neutral-950 font-medium shrink-0"
        className={cn(
          'w-[180px] border-none shadow-none focus:ring-0',
          !orderBy && 'w-[130px]',
        )}
      >
        {!orderBy ? (
          <div className="text-neutral-700 font-medium flex items-center w-full justify-end gap-2 mr-2">
            <ArrowDownNarrowWide className="size-5" />
            <div>Urutkan</div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ArrowDownNarrowWide className="size-5" />
            <SelectValue />
          </div>
        )}
      </SelectTrigger>
      <SelectContent>
        {safeSelect.map((item, idx) => {
          let label = '';
          switch (item) {
            case '-createdAt':
              label = 'Produk Terbaru';
              break;
            case 'createdAt':
              label = 'Produk Terlama';
              break;
            case '-price':
              label = 'Harga Tertinggi';
              break;
            case 'price':
              label = 'Harga Terendah';
              break;
          }

          return (
            <SelectItem
              key={idx}
              value={item}
              onSelect={() => setOrderBy(item)}
            >
              {label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
