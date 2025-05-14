'use client';

import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { GetAllProductCategoryResponse } from '@/lib/types/get-all-product-category-response';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import 'swiper/css/bundle';
// import 'swiper/css/scrollbar';
import { Mousewheel, Scrollbar } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

export default function PopularCategory() {
  const router = useRouter();

  // TODO: handle popular category logic, for now it just fetch based on count product
  const { data, isPending, error } = useQuery({
    queryKey: ['all:category'],
    queryFn: async () => {
      const { data } = await apiclient.get(
        '/product-category?orderBy=-count&pageSize=10',
      );
      return data as GetAllProductCategoryResponse;
    },
  });

  if (error) {
    toast({
      description:
        'Sorry we have problem in our server, please try again later',
      variant: 'destructive',
    });
  }

  // TODO: handle ui when loading (skeleton) and when error!
  return (
    <div className="mt-12">
      <h2 className="text-neutral-700 text-xl font-semibold">
        Kategori Unggulan
      </h2>
      {!isPending && !error && (
        <Swiper
          id="prevent-lenis"
          className="mt-9 cursor-grab"
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            480: {
              slidesPerView: 2,
            },
            640: {
              slidesPerView: 3,
            },
            768: {
              slidesPerView: 4,
            },
            896: {
              slidesPerView: 5,
            },
            1024: {
              slidesPerView: 6,
            },
          }}
          modules={[Mousewheel, Scrollbar]}
          mousewheel={true}
          scrollbar={true}
          // slidesPerView={6}
        >
          {data.categories.map((category, idx) => (
            <SwiperSlide key={idx} className="mb-9">
              <div
                onClick={() => router.push(`/search?category=${category.name}`)}
                className="w-full flex items-center justify-center cursor-pointer"
              >
                <div className="relative aspect-square size-32 flex items-center justify-center bg-neutral-200 rounded-full">
                  <Image
                    src={category.image || '/product-categories/fallback.png'}
                    alt="Category Image"
                    fill
                  />
                </div>
              </div>
              <div
                onClick={() => router.push(`/search?category=${category.name}`)}
                className="flex flex-col w-full items-center justify-center text-neutral-700 mt-1 gap-1 cursor-pointer"
              >
                <p className="whitespace-nowrap line-clamp-1">
                  {category.name}
                </p>
                <p className="text-neutral-500 text-sm">
                  {category.productCount} Items
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}