'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

type Props = {
  items: React.ReactNode[];
  slideToScroll: number;
};

export default function CardCarousel({ items, slideToScroll }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: slideToScroll,
  });

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);

  const onSelect = React.useCallback((embla: typeof emblaApi) => {
    setCanScrollPrev(embla!.canScrollPrev());
    setCanScrollNext(embla!.canScrollNext());
  }, []);

  React.useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="xl:flex-[0_0_23.5%] lg:flex-[0_0_31.6%] md:flex-[0_0_48.5%] flex-[0_0_100%]"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      {canScrollPrev && (
        <>
          <button
            className="absolute left-0 top-[50%] -translate-y-1/2 -translate-x-1/2 bg-neutral-800 rounded-full backdrop:blur-md text-neutral-200"
            onClick={() => {
              scrollPrev();
            }}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="size-8" />
          </button>
        </>
      )}
      {canScrollNext && (
        <>
          <button
            className="absolute -right-7 xl:right-[-22.5px] top-[50%] -translate-y-1/2 -translate-x-1/2 bg-neutral-800 rounded-full backdrop:blur-md text-neutral-200"
            onClick={() => {
              scrollNext();
            }}
            disabled={!canScrollNext}
          >
            <ChevronRight className="size-8" />
          </button>
        </>
      )}
    </div>
  );
}
