'use client';

import { flexRender } from '@tanstack/react-table';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Eye } from 'lucide-react';
import UseDiscountManagement from '@/hooks/useDiscountManagement';
import DiscountManagementPagination from './_components/discountManagementPagination';
import DiscountManagementTable from './_components/discountManagementTable';
import DiscountManagementForm from './_components/discountManagementForm';

type Discount = {
  discount_id: number;
  nama_diskon: string;
  tipe_diskon: string;
  mode_diskon: string;
  nilai_diskon: number;
  min_pembelian: number;
  potongan_maks?: number;
  kode_voucher?: string;
  batas_penggunaan?: number;
  kadaluwarsa?: string;
};

function getStatus(exp?: string) {
  if (!exp) return 'Tidak Ada';
  return new Date(exp) >= new Date() ? 'Aktif' : 'Kadaluwarsa';
}

export default function DiscountManagement() {
  const {
    handleSearchChange,
    handleStatusFilter,
    table,
    globalFilter,
    columns,
    formik,
  } = UseDiscountManagement();

  return (
    <div className="min-h-screen w-full flex flex-col gap-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="sm:text-4xl text-2xl font-bold">Manajemen Diskon</h1>

        {/* Dialog */}
        <DiscountManagementForm formik={formik} />
      </div>

      {/* Column toggles (desktop) */}
      <DropdownMenu modal={false}>
        <div className="hidden lg:hidden md:flex justify-end">
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

      {/* Filters row */}
      <div className="mb-4 flex items-end justify-between">
        <div className="flex gap-2">
          <Input
            placeholder="Cari..."
            value={globalFilter}
            onChange={handleSearchChange}
            className="h-9 w-[200px]"
          />
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-2">
          {/* Tipe filter */}
          <Select onValueChange={handleStatusFilter} defaultValue="all">
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Pilih Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Pilih Tipe</SelectLabel>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="Persentase">Persentase</SelectItem>
                <SelectItem value="Nominal">Nominal</SelectItem>
                <SelectItem value="BOGO">BOGO</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Mode filter */}
          <Select onValueChange={handleStatusFilter} defaultValue="all">
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
          </Select>

          {/* Status filter */}
          <Select onValueChange={handleStatusFilter} defaultValue="all">
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Pilih Status</SelectLabel>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Kadaluwarsa">Kadaluwarsa</SelectItem>
                <SelectItem value="Tidak Ada">Tidak Ada</SelectItem>
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

      {/* Table */}
      <DiscountManagementTable table={table} columns={columns} />

      {/* Pagination */}
      <DiscountManagementPagination table={table} />
    </div>
  );
}
