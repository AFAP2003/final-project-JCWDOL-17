'use client';

import { Separator } from '@/components/ui/separator';
import { FilterIcon } from 'lucide-react';
import CategoryFilter from './category-filter';
import PriceFilter from './price-filter';
import PromoFilter from './promo-filter';

type Props = {
  category?: string;
  promo?: string;
  price?: string;
};

export default function Filter(props: Props) {
  // TODO: currently just fetch 100 category

  return (
    <div className="bg-neutral-50 w-[280px] text-neutral-700 p-6 rounded-xl shadow border border-neutral-100">
      {/* Header */}
      <div className="flex tracking-tight font-semibold items-center gap-2 w-full">
        <FilterIcon />
        <h3>Filter</h3>
      </div>

      <Separator className="my-6" />

      {/* Content */}
      <div className="space-y-6">
        <CategoryFilter category={props.category} />
        <PromoFilter promo={props.promo} />
        <PriceFilter price={props.price} />
      </div>
    </div>
  );
}
