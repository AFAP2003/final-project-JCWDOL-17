'use client';

import ProductCard from '@/components/product-card';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { GetAllProductResponse } from '@/lib/types/get-all-product-response';
import { useQuery } from '@tanstack/react-query';
import 'swiper/css/bundle';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

export default function HighestSoldProduct() {
  // TODO: handle highest sold logic, for now it just fetch based on createdAt product
  const { data, isPending, error } = useQuery({
    queryKey: ['all:product'],
    queryFn: async () => {
      const { data } = await apiclient.get(
        '/product?orderBy=createdAt&pageSize=10',
      );
      return data as GetAllProductResponse;
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
        Produk Terlaris
      </h2>
      {!isPending && !error && (
        <Swiper
          className="mt-9"
          spaceBetween={24}
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            480: {
              slidesPerView: 2,
            },
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            896: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
            1280: {
              slidesPerView: 5,
            },
          }}
          modules={[Navigation]}
          mousewheel={true}
          navigation={true}
          // slidesPerView={6}
        >
          {data.products.map((product, idx) => (
            <SwiperSlide key={idx} className="h-full grow">
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
