import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type Props = {};

export default function SearchBox({}: Props) {
  return (
    <div className="relative lg:max-w-md flex items-center w-full border-[1.5px] rounded-lg px-2 border-green-600 group shadow-sm">
      <Search className="text-neutral-400 group-focus-within:text-green-600 shrink-0" />
      <Input
        className="focus-visible:ring-0 shadow-none border-none text-neutral-700"
        placeholder="Search address name"
      />
    </div>
  );
}
