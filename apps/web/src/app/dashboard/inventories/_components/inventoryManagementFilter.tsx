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
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { flexRender, Table } from '@tanstack/react-table';
import { Store } from '@/lib/interfaces/storeManagement.interface';
import { Category } from '@/lib/interfaces/categoryManagement.interface';

interface InventoryManagementFilterProps {
  globalFilter: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStatusFilter: (value: string) => void;
  table: Table<any>;
  stores: Store[];
  categories: Category[];
  handleCategoryFilter: (value: string) => void;
  handleStoreFilter: (value: string) => void;
}
export default function InventoryManagementFilter({
  globalFilter,
  handleSearchChange,
  handleStatusFilter,
  table,
  stores,
  categories,
  handleStoreFilter,
  handleCategoryFilter,
}: InventoryManagementFilterProps) {
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
        <Select onValueChange={handleStoreFilter} defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filter Status</SelectLabel>
              <SelectItem value="all">Semua Toko</SelectItem>

              {stores.map((store) => (
                <SelectItem value={store.name} key={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select onValueChange={handleCategoryFilter} defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filter Status</SelectLabel>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem value={category.name} key={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select onValueChange={handleStatusFilter} defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filter Status</SelectLabel>
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
