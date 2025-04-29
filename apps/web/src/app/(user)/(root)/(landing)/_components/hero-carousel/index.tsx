/* eslint-disable react/jsx-key */
import Carousel from './carousel';
import CarouselItemFirst from './carousel-item-first';
import CarouselItemSecond from './carousel-item-second';

export default function HeroCarousel() {
  const items = [
    <CarouselItemSecond />,
    <CarouselItemFirst />,
    // <CarouselItemThird />,
  ];

  return (
    <div className="relative rounded-md overflow-hidden shadow border border-neutral-100 h-[360px]">
      <Carousel items={items} />
    </div>
  );
}
