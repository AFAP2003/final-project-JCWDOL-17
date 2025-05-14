'use client';

import ProductCard from '@/components/product-card';
import { apiclient } from '@/lib/apiclient';
import { GetAllProductResponse } from '@/lib/types/get-all-product-response';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import qs from 'query-string';
import { useEffect, useMemo } from 'react';
import { useIntersectionObserver } from 'usehooks-ts';
import FilterMovbile from '../filter-mobile';
import OrderBy from '../order-by';

type Props = {
  searchParams: {
    query?: string;
    orderBy?: 'createdAt' | '-createdAt' | 'price' | '-price';
    price?: string;
    category?: string;
    promo?: string;
  };
};

export default function ProductList({ searchParams }: Props) {
  const query = useInfiniteQuery({
    queryKey: ['all:product', 'search', searchParams],
    queryFn: async ({ pageParam }) => {
      const params = qs.stringify(searchParams, {
        skipEmptyString: true,
        skipNull: true,
      });

      const { data } = await apiclient.get(
        `/product?${params}&pageSize=20&page=${pageParam}`,
      );
      return data as GetAllProductResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (last, page) =>
      last.metadata.currentPage < last.metadata.lastPage
        ? last.metadata.currentPage + 1
        : undefined,
  });

  const products = useMemo(
    () => query.data?.pages.flatMap((page) => page.products) ?? [],
    [query.data],
  );

  const observer = useIntersectionObserver({
    threshold: 0,
    rootMargin: '400px',
  });

  useEffect(() => {
    if (
      observer.isIntersecting &&
      query.hasNextPage &&
      !query.isFetchingNextPage
    ) {
      query.fetchNextPage();
    }
  }, [
    observer.isIntersecting,
    query.hasNextPage,
    query.isFetchingNextPage,
    query,
  ]);

  // TODO: handle ui when loading (skeleton) and when error!
  return (
    <div className="w-full">
      <div>
        <h2 className="text-neutral-700 text-xl font-semibold">Cari Produk</h2>
      </div>

      <div className="w-full flex items-center justify-end max-sm:mt-2">
        <FilterMovbile
          category={searchParams.category}
          price={searchParams.price}
          promo={searchParams.promo}
        />
        <div className="ml-3 text-neutral-400 block lg:hidden">|</div>
        <OrderBy orderBy={searchParams.orderBy} />
      </div>

      <div className="w-full mt-3">
        {!query.isPending && !query.error && (
          <div className="relative">
            {products.length > 0 && (
              <>
                <div className="grid grid-cols-1 min-[380px]:grid-cols-2 min-[580px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Marker */}
                {query.hasNextPage && (
                  <div
                    ref={observer.ref}
                    id="marker"
                    className="-z-50 absolute bottom-0"
                  />
                )}

                {!query.hasNextPage && (
                  <div className="flex w-full justify-center items-center">
                    <div className="mt-9 italic text-neutral-500">
                      Semua produk sudah ditampilkan
                    </div>
                  </div>
                )}
              </>
            )}

            {products.length <= 0 && (
              <div className="w-full h-[calc(85vh-220px)] flex items-center justify-center text-neutral-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="text-base font-medium">🫢 Oops!</div>
                  <div className="flex flex-col w-full justify-center items-center gap-1">
                    <div className="text-base italic">
                      Tidak ada produk yang ditemukan
                    </div>
                    <div className="text-xs text-neutral-500">
                      Coba periksa kembali atau gunakan kata kunci lain.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {query.isPending && !query.error && (
          <div className="flex justify-center items-center h-[calc(85vh-220px)]">
            <div className="italic text-neutral-500">
              <div className="flex justify-center items-center gap-3 flex-col">
                <Loader2 className="size-12 animate-spin" />
                <span className="text-sm">Mencari Produk...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
