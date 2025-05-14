import { notFound } from 'next/navigation';
import Content from './content';

type Props = {
  params: { storeId: string };
};

export default function StoreDetailPage({ params }: Props) {
  if (!params.storeId) notFound();
  return (
    <div>
      <div className="mb-12 space-y-1 max-sm:px-6 max-sm:py-6">
        <div className="flex w-full items-center gap-3">
          <h1 className="sm:text-4xl text-2xl font-bold">Manajemen Toko</h1>
        </div>
        <p className="text-muted-foreground">
          Kelola informasi toko agar tetap akurat dan mudah diakses kapan saja
        </p>
      </div>

      <div className="max-sm:px-6">
        <Content storeId={params.storeId} />
      </div>
    </div>
  );
}
