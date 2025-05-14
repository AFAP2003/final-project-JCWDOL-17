import Content from './content';

type Props = {
  searchParams: {
    storeId: string;
  };
};

export default function ConfigureStorePage({ searchParams }: Props) {
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
        <Content storeId={searchParams.storeId} />
      </div>
    </div>
  );
}
