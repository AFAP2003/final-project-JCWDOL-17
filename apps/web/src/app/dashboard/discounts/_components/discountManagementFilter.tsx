import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
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
import { Eye, X } from 'lucide-react';
import { flexRender, Table } from '@tanstack/react-table';
import { Discount } from '@/lib/interfaces/discountManagement.interface';

interface DiscountManagementFilterProps {
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStatusFilter: (value: string) => void;
  handleTypeFilter: (value: string) => void;
  handleTypeValueFilter: (value: string) => void;
  table: Table<Discount>;
  searchTerm: string;
  clearAllFilters: () => void;
  selectedStatus: string;
  selectedType: string;
  selectedValueType: string;
}
export default function DiscountManagementFilter({
  handleSearchChange,
  handleStatusFilter,
  handleTypeFilter,
  handleTypeValueFilter,
  table,
  searchTerm,
  clearAllFilters,
  selectedStatus,
  selectedValueType,
  selectedType,
}: DiscountManagementFilterProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-2 sm:gap-0">
      <div className="flex flex-col-reverse gap-3 w-full sm:w-auto lg:flex lg:flex-row lg:gap-">
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

      <div className="flex flex-col-reverse lg:flex-row gap-2">
        {/* Tipe filter */}
        <Select onValueChange={handleTypeFilter} value={selectedType}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Pilih Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Pilih Tipe</SelectLabel>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="Diskon Normal">Diskon Normal</SelectItem>
              <SelectItem value="Diskon Syarat">Diskon Syarat</SelectItem>
              <SelectItem value="Beli 1 Gratis 1">Beli 1 Gratis 1</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select onValueChange={handleTypeValueFilter} value={selectedValueType}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Pilih Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Pilih Tipe Nilai</SelectLabel>
              <SelectItem value="all">Semua Tipe Nilai</SelectItem>
              <SelectItem value="Persentase">Persentase</SelectItem>
              <SelectItem value="Nominal">Nominal</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Mode filter */}
        {/* <Select onValueChange={handleStatusFilter} defaultValue="all">
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Pilih Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Pilih Mode</SelectLabel>
                <SelectItem value="all">Semua Mode</SelectItem>
                <SelectItem value="Cart">Keranjang</SelectItem>
                <SelectItem value="Ongkir">Ongkir</SelectItem>
                <SelectItem value="Produk">Produk</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select> */}

        {/* Status filter */}
        <Select onValueChange={handleStatusFilter} value={selectedStatus}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Pilih Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Pilih Status</SelectLabel>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Aktif">Aktif</SelectItem>
              <SelectItem value="Kadaluwarsa">Kadaluwarsa</SelectItem>
              <SelectItem value="Inaktif">Inaktif</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Column toggles (mobile) */}
        <DropdownMenu modal={false}>
          <div className="md:hidden lg:block flex justify-end">
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
                    onCheckedChange={(v) => col.toggleVisibility(!!v)}
                  >
                    {typeof col.columnDef.header === 'string'
                      ? col.columnDef.header
                      : flexRender(col.columnDef.header, col.getContext())}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </div>
        </DropdownMenu>
      </div>
    </div>
  );
}
