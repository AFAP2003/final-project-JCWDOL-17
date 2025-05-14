import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type Props = {
  search: string;
  setSearch: (val: string) => void;
};

export default function SearchBox({ search, setSearch }: Props) {
  return (
    <div className="relative lg:max-w-md flex items-center w-full border border-neutral-200 rounded-lg p-0 group shadow-sm overflow-hidden">
      <div className="flex w-full h-full items-center">
        <div className="bg-neutral-100 shrink-0 h-full flex items-center px-2">
          <Search className="text-neutral-400 shrink-0" />
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="focus-visible:ring-0 shadow-none border-none text-neutral-700 sm:text-sm text-sm"
          placeholder="Search address Label / Province / City / Street"
        />
      </div>
    </div>
  );
}
