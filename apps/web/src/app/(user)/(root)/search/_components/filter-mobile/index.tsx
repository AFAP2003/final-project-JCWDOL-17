import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FilterIcon } from 'lucide-react';
import CategoryFilter from './category-filter';
import PriceFilter from './price-filter';
import PromoFilter from './promo-filter';

type Props = {
  category?: string;
  promo?: string;
  price?: string;
};

export default function FilterMovbile(props: Props) {
  return (
    <Sheet>
      <SheetTrigger className="block lg:hidden">
        <div className="flex items-center gap-2 w-full">
          <FilterIcon className="size-5 text-neutral-700" />
          <h3 className="text-sm">Filter</h3>
        </div>
      </SheetTrigger>
      <SheetContent className="text-neutral-200 bg-neutral-800 border-neutral-500 p-9 py-16">
        <ScrollArea className="h-[75vh] px-3">
          <div className="space-y-6">
            <CategoryFilter category={props.category} />
            <PromoFilter promo={props.promo} />
            <PriceFilter price={props.price} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
