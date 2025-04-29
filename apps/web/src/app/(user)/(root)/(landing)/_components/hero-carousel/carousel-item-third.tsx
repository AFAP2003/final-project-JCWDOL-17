// import { Button } from '@/components/ui/button';
// import Image from 'next/image';

import Image from 'next/image';

export default function CarouselItemThird() {
  return (
    <div className="relative flex flex-col size-full p-6 rounded-md overflow-hidden">
      {/* BG IMAGE */}
      <div className="absolute inset-0">
        <div className="size-full bg-gradient-to-b from-neutral-100 from-10% via-neutral-300 via-80% to-neutral-700 to-20%"></div>
      </div>

      <div className="relative w-full">
        <div className="relative size-72">
          <Image
            src={'/images/delivery-people.webp'}
            alt="People Delivery"
            fill
          />
        </div>
      </div>
    </div>
  );
}
