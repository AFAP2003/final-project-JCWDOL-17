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

interface OrderManagementFilterProps {
  globalFilter: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStatusFilter: (value: string) => void;
  handleWarehouseFilter: (value: string) => void;
  handleDateRangeFilter: (dateRange: { from: Date; to: Date }) => void;
  table: Table<any>;
  warehouses: Array<{ id: string; name: string }>;
}

export default function OrderManagementFilter({
  globalFilter,
  handleSearchChange,
  handleStatusFilter,
  handleWarehouseFilter,
  handleDateRangeFilter,
  table,
  warehouses,
}: OrderManagementFilterProps) {
  const [date, setDate] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date(),
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
              <SelectItem value="WAITING_PAYMENT">
                Menunggu Pembayaran
              </SelectItem>
              <SelectItem value="WAITING_PAYMENT_CONFIRMATION">
                Menunggu Konfirmasi
              </SelectItem>
              <SelectItem value="PROCESSING">Diproses</SelectItem>
              <SelectItem value="SHIPPED">Dikirim</SelectItem>
              <SelectItem value="CONFIRMED">Selesai</SelectItem>
              <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
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
              defaultMonth={date.from}
              selected={{ from: date.from, to: date.to }}
              onSelect={(selectedDate) => {
                if (selectedDate?.from && selectedDate?.to) {
                  setDate({ from: selectedDate.from, to: selectedDate.to });
                  handleDateRangeFilter({
                    from: selectedDate.from,
                    to: selectedDate.to,
                  });
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

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
