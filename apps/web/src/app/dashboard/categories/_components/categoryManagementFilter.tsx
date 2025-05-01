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
import { Eye } from 'lucide-react';

interface CategoryManagementFilterProps {
  globalFilter: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  table: Table<Category>;
}
export default function CategoryManagementFilter({
  globalFilter,
  handleSearchChange,
  table,
}: CategoryManagementFilterProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-2 sm:gap-0">
      <div className="flex gap-2">
        <Input
          placeholder="Cari..."
          value={globalFilter}
          onChange={handleSearchChange}
          className="order-2 h-9 w-[140px] text-sm sm:w-[200px] sm:order-1"
        />
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
