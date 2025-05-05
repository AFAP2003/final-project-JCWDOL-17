import MaxWidthWrapper from '@/components/max-width-wrapper';
import { notFound } from 'next/navigation';
import ProductInfo from './_components/product-info';
import SimilarProduct from './_components/similar-product';

type Props = {
  params: {
    productId: string;
  };
};

export default function ProductDetailPage({ params }: Props) {
  if (!params?.productId) notFound();

  return (
    <MaxWidthWrapper>
      <ProductInfo productId={params.productId} />
      <SimilarProduct productId={params.productId} />
    </MaxWidthWrapper>
  );
}
