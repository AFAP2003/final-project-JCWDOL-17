// import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function CarouselItemFirst() {
  return (
    <div className="relative flex flex-col size-full p-6 rounded-md overflow-hidden">
      {/* BG IMAGE */}
      <div className="absolute inset-0">
        <Image
          src="/images/carousel-image-01.png"
          alt="Carousel Image"
          height={807}
          width={2376}
          className="object-cover object-right-top size-full"
        />
      </div>

      <div className="relative flex flex-col w-full h-full justify-center items-center max-w-md sm:mx-auto">
        <h1 className="w-full font-bold sm:text-center text-neutral-700 text-3xl md:text-4xl">
          Invite your friends and unlock a{' '}
          <span className="text-red-500">5% discount off</span>
        </h1>
        <p className="w-full text-neutral-500 backdrop-blur-sm text-left sm:text-center text-lg max-sm:text-base max-sm:mt-1.5 max-w-sm mr-auto sm:m-0">
          Share your referral code with friends and claim your voucher!
        </p>

        {/* <Button className="mt-6 bg-gradient-to-br from-neutral-800 via-neutral-800 to-neutral-600 hover:scale-105 transition-all duration-100">
          More Info
        </Button> */}
      </div>
    </div>
  );
}
