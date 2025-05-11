'use client';

import { apiclient } from '@/lib/apiclient';
import { GetAllProductResponse } from '@/lib/types/get-all-product-response';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, ShoppingBasket } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';

export default function SearchBox() {
  const [query, setQuery] = useState<string>('');
  const [dbquery] = useDebounceValue(query, 500);
  const router = useRouter();
  const [showResult, setShowResult] = useState(true);

  const { data, isFetching } = useQuery({
    queryKey: ['all:product', 'search', dbquery],
    queryFn: async () => {
      const { data } = await apiclient.get(
        `/product?query=${dbquery}&pageSize=5`,
      );
      return data as GetAllProductResponse;
    },
    enabled: dbquery !== '',
  });

  return (
    <div className="w-full relative">
      <div className="flex gap-3 justify-center items-center w-full relative">
        <Search className="absolute left-2 text-neutral-600" />
        <Input
          value={query}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setShowResult(false);
              router.push(`/search?query=${query}`);
            }
          }}
          onChange={(e) => {
            if (showResult === false) setShowResult(true);
            setQuery(e.target.value);
          }}
          placeholder="Search for product..."
          className="w-full border-t-0 border-x-0 focus-visible:ring-0 bg-neutral-50 shadow-none border-neutral-500 rounded-none pl-12"
        />
      </div>

      {/* Result Loading */}
      {isFetching && showResult && (
        <div className="absolute top-full z-10 mt-3 w-full rounded-md bg-neutral-50 shadow border border-neutral-50 py-6">
          <div className="space-y-5">
            <h3 className="px-6 uppercase font-semibold">Top Match</h3>
            <Separator />
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center flex-col px-5">
                <Loader2 className="my-2 size-10 animate-spin text-neutral-200" />
                <p className="text-muted-foreground">
                  Searching your request...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Search */}
      {!isFetching && data && showResult && (
        <div className="absolute top-full z-10 mt-3 w-full rounded-md bg-neutral-50 shadow border border-neutral-50 py-6 text-neutral-700">
          <div className="space-y-5">
            <h3 className="px-6 uppercase font-semibold">Top Match</h3>
            <Separator />

            {/* In case we have result */}
            {data.products.length > 0 ? (
              <div className="flex flex-col gap-3 w-full">
                {data.products.map((item, idx) => (
                  <div
                    onClick={() => {
                      setShowResult(false);
                      setQuery('');
                      router.push(`/product/${item.id}`);
                    }}
                    key={idx}
                    className="flex w-full cursor-pointer items-center gap-3 px-6 py-3 hover:bg-neutral-200"
                  >
                    <div className="relative aspect-square w-9 rounded-md overflow-hidden">
                      {item.images.length ? (
                        <>
                          <Image
                            src={item.images[0].imageUrl}
                            alt={item.name}
                            fill
                          />
                        </>
                      ) : (
                        <ShoppingBasket className="size-full text-neutral-600" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-base font-medium line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs mt-1 capitalize">
                        {item.category.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-center flex-col px-5">
                  <p className="px-5 py-3 text-neutral-500">
                    Oops, no results found
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
