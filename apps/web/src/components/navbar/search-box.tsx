'use client';

import { apiclient } from '@/lib/apiclient';
import { GetAllProductResponse } from '@/lib/types/get-all-product-response';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, ShoppingBasket } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';
import { useEffect, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';

type Props = {
  onSearchStart?: () => void;
  onSearchEnd?: () => void;
};

export default function SearchBox(props: Props) {
  const searchParams = useSearchParams();
  const path = usePathname();
  const router = useRouter();

  const isSearchPage = path === '/search';

  const [query, setQuery] = useState<string>(() => {
    if (!isSearchPage) return '';
    const q = searchParams.get('query') || '';
    return q;
  });
  const [dbquery] = useDebounceValue(query, 500);
  const [showResult, setShowResult] = useState(true);

  const { data, isFetching } = useQuery({
    queryKey: ['all:product', 'search', dbquery],
    queryFn: async () => {
      const { data } = await apiclient.get(
        `/product?query=${dbquery}&pageSize=5`,
      );
      return data as GetAllProductResponse;
    },
    enabled: dbquery !== '' && !isSearchPage,
  });

  useEffect(() => {
    if (!isSearchPage && query) {
      setQuery('');
    }
  }, [isSearchPage]);

  return (
    <div className="w-full relative">
      <div className="flex gap-3 justify-center items-center w-full relative">
        <Search className="absolute left-2 text-neutral-600" />
        <Input
          value={query}
          onFocus={() => {
            if (props.onSearchStart) {
              props.onSearchStart();
            }
            if (!isSearchPage) {
              setShowResult(true);
            }
          }}
          onBlur={() => {
            if (props.onSearchEnd) {
              props.onSearchEnd();
            }
            setShowResult(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setShowResult(false);
              const params = qs.parse(searchParams.toString());
              params['query'] = query;
              const searchquery = qs.stringify(params, {
                skipEmptyString: true,
                skipNull: true,
              });

              router.push(`/search?${searchquery}`);
            }
          }}
          onChange={(e) => {
            if (showResult === false) setShowResult(true);
            setQuery(e.target.value);
          }}
          placeholder="Search for product..."
          className="w-full border-t-0 border-x-0 focus-visible:ring-0 bg-neutral-50 shadow-none border-neutral-500 rounded-none pl-12 text-sm sm:text-sm"
        />
      </div>

      {/* Result Loading */}
      {isFetching && showResult && !isSearchPage && (
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
      {!isFetching && data && showResult && !isSearchPage && (
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
