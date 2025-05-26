import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Category } from '@/lib/interfaces/categoryManagement.interface';
import { flexRender, Table } from '@tanstack/react-table';
import { Eye, X } from 'lucide-react';

interface CategoryManagementFilterProps {
  globalFilter: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  table: Table<Category>;
  searchTerm: string;
  clearAllFilters: () => void;
}
export default function CategoryManagementFilter({
  globalFilter,
  handleSearchChange,
  table,
  searchTerm,
  clearAllFilters,
}: CategoryManagementFilterProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-2 sm:gap-0">
      <div className="flex gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-auto">
          <Input
            placeholder="Cari..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="order-2 h-9 w-full sm:w-[200px] text-sm sm:order-1 pr-8"
          />
          {searchTerm && (
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() =>
                handleSearchChange({
                  target: { value: '' },
                } as React.ChangeEvent<HTMLInputElement>)
              }
            >
              <X size={16} />
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-xs"
        >
          Atur Ulang Filter
        </Button>
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Eye /> Lihat
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Kolom</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(val) => col.toggleVisibility(!!val)}
                >
                  {typeof col.columnDef.header === 'string'
                    ? col.columnDef.header
                    : flexRender(col.columnDef.header, col.getContext())}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
