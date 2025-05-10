type Props = {
  searchParams: {
    query?: string;
    orderBy?: 'createdAt' | '-createdAt' | 'price' | '-price';
    price?: string;
    category?: string;
    promo?: string;
  };
};

export default function SearchPage({ searchParams }: Props) {
  console.log({ searchParams });
  return <div>SearchPage </div>;
}
