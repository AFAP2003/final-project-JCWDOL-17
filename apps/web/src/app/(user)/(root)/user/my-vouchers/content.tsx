'use client';

import PaginationButton from '@/components/pagination-button';
import { Card } from '@/components/ui/card';
import VoucherCard from '@/components/voucher-card';
import { apiclient } from '@/lib/apiclient';
import { useSession } from '@/lib/auth/client';
import { GetAllVoucherResponse } from '@/lib/types/get-all-voucher-response';
import { useQuery } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import qs from 'query-string';
import FilterType from './filter-type';
import SearchBox from './search-box';

type Props = {
  query?: string;
  type?: string;
  page?: string;
};

export default function Content(props: Props) {
  //   const searchParams = useSearchParams();
  const { data: session } = useSession();

  const fetch = useQuery({
    queryKey: [
      'all:voucher',
      props.query,
      props.type,
      props.page,
      session?.user.id,
    ],
    queryFn: async () => {
      const q = qs.stringify(props);
      const { data } = await apiclient.get<GetAllVoucherResponse>(
        q ? `/voucher/me?${q}&pageSize=4` : '/voucher/me?pageSize=2',
      );
      return data;
    },
    enabled: !!session,
  });

  return (
    <Card className="p-6 h-full">
      <div className="size-full flex flex-col">
        <div className="w-full mb-6">
          <SearchBox query={props.query} />
        </div>
        <div className="flex w-full justify-end mb-3">
          <FilterType type={props.type} />
        </div>
        {!fetch.isError && !fetch.isPending && (
          <>
            {fetch.data.vouchers.length ? (
              <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-3">
                {fetch.data.vouchers.map((voucher) => (
                  <VoucherCard key={voucher.id} voucher={voucher} />
                ))}
              </div>
            ) : (
              <div className="size-full flex items-center justify-center text-neutral-400 h-full">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="text-base font-medium text-center">
                    🫢 Oops!
                  </div>
                  <div className="flex flex-col w-full justify-center items-center gap-1 text-center">
                    <div className="text-sm italic">
                      Tidak ada voucher yang ditemukan
                    </div>
                    <div className="text-xs text-neutral-500">
                      Coba periksa kembali atau gunakan kata kunci lain.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!fetch.isError && fetch.isPending && (
          <div className="size-full flex items-center justify-center text-neutral-400 h-full">
            <div className="flex flex-col items-center justify-center gap-1">
              <Loader2Icon className="animate-spin size-7" />
              <div className="text-sm italic">Tunggu sebentar ya...</div>
            </div>
          </div>
        )}

        <PaginationButton
          className="pt-6 lg:mt-auto max-lg:mb-auto"
          metadata={fetch.data?.metadata}
        />
      </div>
    </Card>
  );
}
