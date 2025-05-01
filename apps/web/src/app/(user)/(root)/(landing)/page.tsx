import MaxWidthWrapper from '@/components/max-width-wrapper';
import PopularCategory from './_components/featured-category';
import HeroCarousel from './_components/hero-carousel';

export default function Landing() {
  return (
    <MaxWidthWrapper className="">
      <HeroCarousel />
      <PopularCategory />
    </MaxWidthWrapper>
  );
}
