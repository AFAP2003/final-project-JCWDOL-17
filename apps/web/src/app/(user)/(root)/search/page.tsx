import MaxWidthWrapper from '@/components/max-width-wrapper';
import Filter from './_components/filter';
import ProductList from './_components/product-list/product-list';

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
      <div className="flex gap-12">
        <div className="hidden lg:block">
          <Filter
            category={searchParams.category}
            price={searchParams.price}
            promo={searchParams.promo}
          />
        </div>
        <div className="w-full">
          <ProductList searchParams={searchParams} />
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
