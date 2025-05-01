import { Button } from '@/components/ui/button';
import { ShoppingBasketIcon } from 'lucide-react';
import Image from 'next/image';

export default function CarouselItemSecond() {
  return (
    <div className="relative flex flex-col size-full p-6 rounded-md overflow-hidden">
      {/* BG IMAGE */}
      <div className="absolute inset-0">
        <Image
          src="/images/carousel-image-02.jpg"
          alt="Carousel Image"
          height={900}
          width={3360}
          className="object-cover object-center size-full"
        />
      </div>

      <div className="relative flex flex-col w-full h-full justify-center items-center max-w-md text-neutral-200 md:ml-6">
        <h1 className="font-bold text-3xl md:text-4xl">
          Order Tasty Fruits and Get Free Delivery!
        </h1>

        <div className="flex flex-col sm:flex-row w-full items-start sm:items-center mt-6 gap-3">
          <Button className="bg-gradient-to-br from-neutral-800 via-neutral-800 to-neutral-600 hover:scale-105 transition-all duration-100">
            <ShoppingBasketIcon /> Shop Now
          </Button>

          <p className="text-sm sm:text-base">2500+ Fresh Products</p>
        </div>
      </div>
    </div>
  );
}
