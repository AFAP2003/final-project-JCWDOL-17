'use client';

import {
  type ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { refetchNow } from '@/lib/tanstack-query';
import { cn } from '@/lib/utils';
import { FilterIcon, PlusIcon, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const router = useRouter();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
  });

  const statusFilterValue = table.getColumn('status')?.getFilterValue() as
    | boolean
    | undefined;

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full gap-4 py-4 px-1">
        {/* Left Side: Search & Filter */}
        <div className="flex flex-col lg:flex-row w-full lg:items-center lg:gap-4 gap-3">
          {/* Search */}
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
            <Input
              placeholder="Cari Toko / Alamat / Kota / Admin"
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(String(e.target.value))}
              className="pl-10 pr-4 py-2 rounded-lg border border-neutral-400 focus-visible:ring-0 text-sm text-neutral-600"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <FilterIcon className="text-neutral-400 size-4 hidden lg:block" />
            <Select
              onValueChange={(value) =>
                table
                  .getColumn('status')
                  ?.setFilterValue(
                    value === 'all' ? undefined : value === 'active',
                  )
              }
            >
              <SelectTrigger
                className={cn(
                  'w-[150px] focus:ring-0 border-neutral-400 rounded-lg',
                  statusFilterValue === true
                    ? 'text-green-600'
                    : statusFilterValue === false
                      ? 'text-red-600'
                      : 'text-neutral-700',
                )}
              >
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem
                  className="text-green-600 hover:text-green-600"
                  value="active"
                >
                  Active
                </SelectItem>
                <SelectItem
                  className="text-red-600 hover:text-red-600"
                  value="inactive"
                >
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Side: Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => {
              refetchNow(['all:available:admin']);
              router.push(`/dashboard/stores/configure`);
            }}
            className="rounded-lg w-full lg:w-auto"
          >
            <PlusIcon />
            <span className="ml-2">Buat Toko Baru</span>
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader className="!rounded-xl border bg-neutral-50 w-fit">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-neutral-50">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="whitespace-nowrap text-neutral-700 px-3"
                  style={{
                    width: `${header.getSize()}px`,
                    maxWidth: `${header.getSize()}px`,
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="!rounded-xl border text-neutral-600">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="hover:bg-neutral-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    style={{
                      width: `${cell.column.getSize()}px`,
                      maxWidth: `${cell.column.getSize()}px`,
                    }}
                    key={cell.id}
                    className="px-3 whitespace-nowrap overflow-clip"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
