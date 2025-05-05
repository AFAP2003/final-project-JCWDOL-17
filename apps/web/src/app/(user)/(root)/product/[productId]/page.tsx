import MaxWidthWrapper from '@/components/max-width-wrapper';
import { notFound } from 'next/navigation';
import Content from './_components/content';
import SimilarProduct from './_components/similar-product';

type Props = {
  params: {
    productId: string;
  };
};

export default function ProductDetail({ params }: Props) {
  if (!params?.productId) notFound();

  return (
    <MaxWidthWrapper>
      <Content productId={params.productId} />
      <SimilarProduct productId={params.productId} />
    </MaxWidthWrapper>
  );
}
