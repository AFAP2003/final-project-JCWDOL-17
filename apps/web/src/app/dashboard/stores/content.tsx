'use client';

import StatCard from '@/components/start-card';
import { apiclient } from '@/lib/apiclient';
import { GetAllStoreResponse } from '@/lib/types/get-all-store-response';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ShieldBan, ShieldPlus, Store } from 'lucide-react';
import { columns, DataColumnType } from './_components/column';
import { DataTable } from './_components/data-table';
import { ContentSkeleton } from './content-skeleton';

export default function Content() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['all:store', 'management'],
    queryFn: async () => {
      const { data } = await apiclient.get<GetAllStoreResponse>(
        `/store?page=1&pageSize=100`,
      );
      return data;
    },
  });

  if (isPending) return <ContentSkeleton />;
  if (!data) return <ContentSkeleton />;

  const datacolumn: DataColumnType[] =
    data?.stores.map((store) => {
      return {
        storeId: store.id,
        address: store.address,
        admin: store?.admin?.name || '-',
        city: store.city,
        name: store.name,
        status: store.isActive,
      };
    }) || [];

  return (
    <div className="w-full">
      <div className="mb-12 mt-9">
        <div className="flex max-w-7xl gap-4 max-xl:flex-col">
          <StatCard
            title="Total Toko"
            value={data?.extension.totalStore || 0}
            icon={<Store className="h-6 w-6 text-blue-600" />}
          />
          <StatCard
            title="Active Toko"
            value={data?.extension.activeStore || 0}
            icon={<ShieldPlus className="h-6 w-6 text-green-600" />}
          />
          <StatCard
            title="Inactive Toko"
            value={data?.extension.inactiveStore || 0}
            icon={<ShieldBan className="h-6 w-6 text-orange-600" />}
          />
        </div>
      </div>

      <div>
        <div className="mb-4 text-neutral-700 font-semibold">Daftar Toko</div>
        <div
          className={cn(
            'w-full sm:w-[calc(92vw)] md:w-[calc(93vw-255px)] overflow-x-auto',
          )}
        >
          <DataTable columns={columns} data={datacolumn} />
        </div>
      </div>
    </div>
  );
}
