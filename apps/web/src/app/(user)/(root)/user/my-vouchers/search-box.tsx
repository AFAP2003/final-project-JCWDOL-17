import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';
import { useEffect, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

type Props = {
  query?: string;
};

export default function SearchBox({ query }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(query || '');
  const [dbsearch] = useDebounceValue(search, 500);

  useEffect(() => {
    const param = qs.parse(searchParams.toString());
    param['query'] = dbsearch;
    param['page'] = `1`;
    const q = qs.stringify(param, {
      skipEmptyString: true,
      skipNull: true,
    });

    router.push(`/user/my-vouchers?${q}`);
  }, [dbsearch]);

  return (
    <div className="relative lg:max-w-md flex items-center w-full border border-neutral-200 rounded-lg p-0 group shadow-sm overflow-hidden">
      <div className="flex w-full h-full items-center bg-neutral-100">
        <div className="shrink-0 h-full flex items-center px-2">
          <Search className="text-neutral-400 shrink-0" />
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="focus-visible:ring-0 shadow-none border-none text-neutral-700 bg-white/80 sm:text-sm text-sm"
          placeholder="Cari voucher ..."
        />
      </div>
    </div>
  );
}
