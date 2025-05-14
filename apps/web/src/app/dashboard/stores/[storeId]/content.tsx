'use client';

import { apiclient } from '@/lib/apiclient';
import { GetStoreByIdResponse } from '@/lib/types/get-store-by-id-response';
import { useQuery } from '@tanstack/react-query';

import StoreCard from './store-card';

type Props = {
  storeId?: string;
};

export default function Content({ storeId }: Props) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['id:store', storeId],
    queryFn: async () => {
      const { data } = await apiclient.get<GetStoreByIdResponse>(
        `/store/${storeId}`,
      );
      return data;
    },
  });

  if (isPending) {
    return <div></div>;
  }
  if (!data) return <div></div>;

  return (
    <div className="max-sm:px-6">
      <StoreCard store={data} />
    </div>
  );
}
