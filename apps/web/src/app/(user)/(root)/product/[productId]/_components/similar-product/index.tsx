'use client';

import ProductCard from '@/components/product-card';
import { apiclient } from '@/lib/apiclient';
import { GetAllProductResponse } from '@/lib/types/get-all-product-response';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useIntersectionObserver } from 'usehooks-ts';

type Props = {
  productId: string;
};

export default function SimilarProduct({ productId }: Props) {
  const query = useInfiniteQuery({
    queryKey: ['all:product', 'similar:category', productId],
    queryFn: async ({ pageParam }) => {
      const { data } = await apiclient.get(
        `/product/${productId}/category/similar?orderBy=-createdAt&pageSize=10&page=${pageParam}`,
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

  return (
    <div className="mt-12 text-neutral-700">
      <h2 className="text-neutral-700 text-xl font-semibold">Produk Serupa</h2>
      {!query.isPending && !query.error && (
        <div className="mt-9 relative">
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {products?.map((product) => (
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
        </div>
      )}
    </div>
  );
}
