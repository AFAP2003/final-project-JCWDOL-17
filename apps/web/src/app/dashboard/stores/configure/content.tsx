'use client';

import { apiclient } from '@/lib/apiclient';
import { GetStoreByIdResponse } from '@/lib/types/get-store-by-id-response';
import { useQuery } from '@tanstack/react-query';
import StoreForm from './store-form';
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
    enabled: !!storeId,
  });

  return (
    <div>
      {storeId && !isPending && (
        <div className="max-sm:px-6">
          <StoreForm store={data} />
        </div>
      )}
      {!storeId && (
        <div className="max-sm:px-6">
          <StoreForm />
        </div>
      )}
    </div>
  );
}
