import MaxWidthWrapper from '@/components/max-width-wrapper';
import HeroCarousel from './_components/hero-carousel';
import HighestSoldProduct from './_components/highest-sold-product';
import LatestProducts from './_components/latest-products';
import PopularCategory from './_components/popular-category';
import PromoLink from './_components/promo-link';

export default function Landing() {
  return (
    <MaxWidthWrapper className="">
      <HeroCarousel />
      <PopularCategory />
      <HighestSoldProduct />
      <PromoLink />
      <LatestProducts />
    </MaxWidthWrapper>
  );
}
