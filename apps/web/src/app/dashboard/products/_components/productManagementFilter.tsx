import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/interfaces/userManagement.interface';
import { flexRender, Table } from '@tanstack/react-table';
import { Category } from '@/lib/interfaces/categoryManagement.interface';

interface ProductManagementFilterProps {
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStatusFilter: (value: string) => void;
  table: Table<User>;
  categories: Category[];
  handleCategoryFilter: (value: string) => void;
  selectedStatus: 'all' | 'Stok Tersedia' | 'Stok Rendah' | 'Stok Habis';
  searchTerm: string;
  clearAllFilters: () => void;
  selectedCategory: string;
}

export default function ProductManagementFilter({
  handleSearchChange,
  handleStatusFilter,
  table,
  categories,
  handleCategoryFilter,
  selectedStatus,
  searchTerm,
  clearAllFilters,
  selectedCategory,
}: ProductManagementFilterProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-2 sm:gap-0">
      <div className="flex flex-col-reverse gap-4 w-full sm:w-auto lg:flex lg:flex-row lg:gap-4">
        <div className="relative w-full sm:w-auto ">
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
        <Select onValueChange={handleCategoryFilter} value={selectedCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Pilih Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Pilih Kategori</SelectLabel>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem value={category.id} key={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select onValueChange={handleStatusFilter} value={selectedStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Pilih Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Pilih Status</SelectLabel>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Stok Tersedia">Stok Tersedia</SelectItem>
              <SelectItem value="Stok Rendah">Stok Rendah</SelectItem>
              <SelectItem value="Stok Habis">Stok Habis</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <DropdownMenu modal={true}>
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
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {typeof column.columnDef.header === 'string'
                    ? column.columnDef.header
                    : flexRender(column.columnDef.header, column.getContext())}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
