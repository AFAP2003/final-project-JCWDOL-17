'use client';

import {
  Carousel as CarouselContainer,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { useEffect, useState } from 'react';

type Props = {
  items: React.ReactNode[];
};

export default function Carousel({ items }: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (api && !isPaused) {
      const intervalId = setInterval(() => {
        api.scrollNext();
      }, 3000); // Change slide every 3 seconds

      return () => clearInterval(intervalId);
    }
  }, [api, isPaused]);

  const handleInteraction = () => {
    setIsPaused(true);
    // Resume auto-play after 5 seconds of inactivity
    // setTimeout(() => setIsPaused(false), 5000);
  };

  const handleDotClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
      handleInteraction();
    }
  };

  return (
    <div className="relative z-0 size-full overflow-hidden">
      <CarouselContainer
        setApi={setApi}
        opts={{
          loop: true,
          align: 'start',
          skipSnaps: false,
          dragFree: false,
        }}
        onMouseDown={handleInteraction}
        onMouseUp={() => setIsPaused(false)}
        className="size-full"
      >
        <CarouselContent className="m-0 size-full p-0 lalala">
          {items.map((item, index) => (
            <CarouselItem
              key={index}
              className="m-0 cursor-grab p-0 active:cursor-grabbing"
            >
              {item}
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselContainer>
      <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            className={cn(
              'w-3 h-3 rounded-full transition-all',
              current === index ? 'bg-neutral-800' : 'bg-neutral-50',
            )}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </div>
    </div>
  );
}
