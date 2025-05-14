import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { flexRender, Table } from "@tanstack/react-table";
import { Discount } from "@/lib/interfaces/discountManagement.interface";

interface DiscountManagementFilterProps{
    globalFilter :string
    handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleStatusFilter:(value:string)=>void
    handleTypeFilter: (value: string) => void
    handleTypeValueFilter:(value:string) =>void
    table:Table<Discount>
}
export default function DiscountManagementFilter({
    globalFilter,
    handleSearchChange,
    handleStatusFilter,
    handleTypeFilter,
    handleTypeValueFilter,
    table
}:DiscountManagementFilterProps){
   
    return(
        <div className="mb-4 flex items-end justify-between">
        <div className="flex gap-2">
          <Input
            placeholder="Cari..."
            value={globalFilter}
            onChange={handleSearchChange}
            className="h-9 w-[140px] sm:w-[200px]"
          />
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-2">
          {/* Tipe filter */}
          <Select onValueChange={handleTypeFilter} defaultValue="all">
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

          <Select onValueChange={handleTypeValueFilter} defaultValue="all">
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
    )
}