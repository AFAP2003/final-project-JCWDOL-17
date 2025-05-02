'use client';

import ProductCard from '@/components/product-card';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { GetAllProductResponse } from '@/lib/types/get-all-product-response';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

type Props = {};

export default function LatestProducts({}: Props) {
  // TODO: handle highest sold logic, for now it just fetch based on createdAt product
  const { data, isPending, error } = useQuery({
    queryKey: ['all:product', 'latest'],
    queryFn: async () => {
      const { data } = await apiclient.get(
        '/product?orderBy=-createdAt&pageSize=30',
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
        Masih Segar Nih!
      </h2>
      {!isPending && !error && (
        <div className="mt-9">
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {data.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="flex w-full justify-center items-center">
            <Link
              className="mt-9 underline underline-offset-4 cursor-pointer"
              href="/#"
            >
              Lihat Lainnya
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
