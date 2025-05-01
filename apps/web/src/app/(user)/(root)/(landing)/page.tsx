import MaxWidthWrapper from '@/components/max-width-wrapper';
import HeroCarousel from './_components/hero-carousel';
import HighestSoldProduct from './_components/highest-sold-product';
import PopularCategory from './_components/popular-category';

export default function Landing() {
  return (
    <MaxWidthWrapper className="">
      <HeroCarousel />
      <PopularCategory />
      <HighestSoldProduct />
    </MaxWidthWrapper>
  );
}
