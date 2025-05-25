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
import { Eye, Calendar } from 'lucide-react';
import { flexRender, Table } from '@tanstack/react-table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useState } from 'react';
import { OrderStatus } from '@/lib/enums';
import { OrderManagementFilterProps } from '@/lib/interfaces/orders';

export default function OrderManagementFilter({
  globalFilter,
  handleSearchChange,
  handleStatusFilter,
  handleWarehouseFilter,
  handleDateRangeFilter,
  table,
  warehouses,
}: OrderManagementFilterProps) {
  const [date, setDate] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });

  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2 sm:gap-4">
      <div className="flex gap-2">
        <Input
          placeholder="Cari nomor pesanan..."
          value={globalFilter}
          onChange={handleSearchChange}
          className="order-2 h-9 w-[140px] text-sm sm:w-[200px] sm:order-1"
        />
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
        <Select onValueChange={handleWarehouseFilter} defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Pilih Gudang" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Pilih Gudang</SelectLabel>
              <SelectItem value="all">Semua Gudang</SelectItem>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select onValueChange={handleStatusFilter} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Pilih Status</SelectLabel>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value={OrderStatus.WAITING_PAYMENT}>
                Menunggu Pembayaran
              </SelectItem>
              <SelectItem value={OrderStatus.WAITING_PAYMENT_CONFIRMATION}>
                Menunggu Konfirmasi
              </SelectItem>
              <SelectItem value={OrderStatus.PROCESSING}>Diproses</SelectItem>
              <SelectItem value={OrderStatus.SHIPPED}>Dikirim</SelectItem>
              <SelectItem value={OrderStatus.CONFIRMED}>Selesai</SelectItem>
              <SelectItem value={OrderStatus.CANCELLED}>Dibatalkan</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              <span>
                {date.from ? (
                  date.to ? (
                    <>
                      {format(date.from, 'dd/MM/yy')} -{' '}
                      {format(date.to, 'dd/MM/yy')}
                    </>
                  ) : (
                    format(date.from, 'dd/MM/yy')
                  )
                ) : (
                  'Pilih Tanggal'
                )}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={date.from || undefined}
              selected={{
                from: date.from || undefined,
                to: date.to || undefined,
              }}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  setDate({
                    from: selectedDate.from || null,
                    to: selectedDate.to || null,
                  });

                  if (selectedDate?.from && selectedDate?.to) {
                    handleDateRangeFilter({
                      from: selectedDate.from,
                      to: selectedDate.to,
                    });
                  }
                } else {
                  setDate({ from: null, to: null });
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Eye className="h-4 w-4 mr-2" /> Lihat
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
                    : column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
