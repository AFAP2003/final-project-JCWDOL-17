import MaxWidthWrapper from '@/components/max-width-wrapper';
import Filter from './_components/filter';

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
  return (
    <MaxWidthWrapper>
      <div>
        <Filter
          category={searchParams.category}
          price={searchParams.price}
          promo={searchParams.promo}
        />
      </div>
    </MaxWidthWrapper>
  );
}
