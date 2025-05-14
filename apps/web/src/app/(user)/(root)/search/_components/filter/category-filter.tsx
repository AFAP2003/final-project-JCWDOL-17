'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { GetAllProductCategoryResponse } from '@/lib/types/get-all-product-category-response';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';
import { useEffect, useState } from 'react';

type Props = {
  category?: string;
};

export default function CategoryFilter({ category }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState(
    category?.trim().split(',') || [],
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const param = qs.parse(searchParams.toString());
    param['category'] = selectedCategories.join(',');
    const query = qs.stringify(param, {
      skipEmptyString: true,
      skipNull: true,
    });
    setIsProcessing(false);
    router.push(`/search?${query}`);
  }, [selectedCategories]);

  const { data, isPending, error } = useQuery({
    queryKey: ['all:category'],
    queryFn: async () => {
      const { data } = await apiclient.get(
        '/product-category?orderBy=-count&pageSize=100',
      );
      return data as GetAllProductCategoryResponse;
    },
    staleTime: 5,
  });

  if (error) {
    toast({
      description:
        'Sorry we have problem in our server, please try again later',
      variant: 'destructive',
    });
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center w-full">
        <h4 className="text-base font-medium tracking-tight text-neutral-800">
          Category
        </h4>
        {selectedCategories.length > 0 && (
          <div
            onClick={() => {
              setIsProcessing(true);
              setSelectedCategories([]);
            }}
            className="flex items-center gap-0.5 text-xs cursor-pointer p-1 hover:rounded-xl hover:bg-neutral-200 transition-all duration-200"
          >
            <X className="text-red-500 size-4" />
            <span className="text-neutral-500">Clear</span>
          </div>
        )}
      </div>
      <ScrollArea id="prevent-lenis" className="w-full h-[270px] pr-2">
        <div className="space-y-1.5">
          {data?.categories?.map((category, idx) => (
            <div
              key={category.id}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted transition-colors group"
              title={category.name}
            >
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.name)}
                disabled={isProcessing}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setIsProcessing(true);
                    setSelectedCategories((prev) => [...prev, category.name]);
                  } else {
                    setSelectedCategories((prev) =>
                      prev.filter((c) => c !== category.name),
                    );
                  }
                }}
              />
              <Label
                htmlFor={category.id}
                className="text-sm font-medium leading-none truncate max-w-[180px] group-hover:text-primary"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
