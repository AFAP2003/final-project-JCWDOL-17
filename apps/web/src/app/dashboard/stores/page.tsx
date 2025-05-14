import Content from './content';

type Props = {
  searchParams: {
    query?: string;
    page?: string;
  };
};

export default function StoresPage({ searchParams }: Props) {
  return (
    <div>
      <div className="mb-12 space-y-1">
        <h1 className="sm:text-4xl text-2xl font-bold">Manajemen Toko</h1>
        <p className="text-muted-foreground">
          Kelola semua toko yang terdaftar dalam sistem
        </p>
      </div>

      <Content />
    </div>
  );
}
