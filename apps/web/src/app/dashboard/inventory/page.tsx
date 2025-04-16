'use client';

import { useState } from 'react';
import { Badge } from "@/components/shadcn/badge";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  ChevronDown,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/table';
import { Input } from '@/components/shadcn/input';
import { Button } from '@/components/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/shadcn/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/shadcn/dialog';

// ------------------------------------
// Sample data
// ------------------------------------
const inventoryData = [
  {
    id: 1,
    produk: 'Sunmi Beras Putih Premium 5 kg',
    toko: 'Jakarta Store',
    stok: '0',
    status: 'Stok Habis',
    terakhir_Diperbarui: '2 Jam Lalu',
  },
  {
    id: 2,
    produk: 'Hati Ayam Organik Hona Farm',
    toko: 'Surabaya Store',
    stok: '70',
    status: 'Tersedia',
    terakhir_Diperbarui: '6 Jam Lalu',
  },
  {
    id: 3,
    produk: 'Healthy Republic Bumbu Marinasi Rendang 120 gram',
    toko: 'Medan Store',
    stok: '10',
    status: 'Stok Rendah',
    terakhir_Diperbarui: '1 Hari Lalu',
  },
];

// ------------------------------------
// Table columns
// ------------------------------------
const columns: ColumnDef<any>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'produk', header: 'Produk' },
  { accessorKey: 'toko', header: 'Toko' },
  { accessorKey: 'stok', header: 'Stok' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'terakhir_Diperbarui', header: 'Terakhir Diperbarui' },
  { accessorKey: 'action', header: 'Aksi' },
];

// ------------------------------------
// Main component
// ------------------------------------
export default function Products() {
  const [data] = useState(inventoryData);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Create the TanStack Table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Handler for the status filter dropdown.
  // When "all" is selected, the filter on the status column is cleared.
  const handleStatusFilter = (value: string) => {
    if (value === 'all') {
      table.getColumn('status')?.setFilterValue(undefined);
    } else {
      table.getColumn('status')?.setFilterValue(value);
    }
  };

  // Handler for the global search input (if needed)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Example: if you want to implement global search across multiple columns,
    // you can set up your logic here.
  };

  return (
    <div className="min-h-screen w-full flex flex-col gap-6 p-4">
      {/* Header with title and "Perbarui Stok" modal */}
      <div className="flex justify-between items-center">
        <h1 className="sm:text-4xl text-2xl font-bold">Manajemen Inventaris</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-[150px]">
              <Plus className="w-4 h-4 mr-1" />
              Perbarui Stok
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] sm:max-h-full overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Perbarui Stok</DialogTitle>
              <DialogDescription>
                Isi detail di bawah ini untuk perbarui stok.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Product Select */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Produk
                </label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Produk</SelectLabel>
                      <SelectItem value="Sunmi Beras Putih Premium 5 kg">
                        Sunmi Beras Putih Premium 5 kg
                      </SelectItem>
                      <SelectItem value="Hati Ayam Organik Hona Farm">
                        Hati Ayam Organik Hona Farm
                      </SelectItem>
                      <SelectItem value="Healthy Republic Bumbu Marinasi Rendang 120 gram">
                        Healthy Republic Bumbu Marinasi Rendang 120 gram
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {/* Store Select */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Toko
                </label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Toko" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Toko</SelectLabel>
                      <SelectItem value="Jakarta Store">Jakarta Store</SelectItem>
                      <SelectItem value="Surabaya Store">Surabaya Store</SelectItem>
                      <SelectItem value="Medan Store">Medan Store</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {/* Quantity */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Kuantitas
                </label>
                <Input type="number" placeholder="Masukkan Kuantitas" />
              </div>
              {/* Current Stock - Editable */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Stok Sekarang
                </label>
                <Input type="number" placeholder="Enter current stock" />
              </div>
              {/* New Stock - Editable */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Stok Baru
                </label>
                <Input type="number" placeholder="Enter new stock" />
              </div>
              {/* Notes (Textarea) */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Catatan
                </label>
                <textarea
                  placeholder="Masukkan alasan kenapa merubah kuantitas"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Simpan Perubahan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter row: Global search, status filter, and column visibility toggler */}
      <div className="mb-4 flex  items-end justify-between gap-2 sm:gap-0">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Cari..."
            onChange={handleSearchChange}
            className="order-2 h-9 w-[140px] text-sm sm:w-[200px] sm:order-1"
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 ">
        <Select onValueChange={handleStatusFilter} defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Filter Status</SelectLabel>
                <SelectItem value="all">Semua Toko</SelectItem>
                <SelectItem value="Tersedia">Jakarta Store</SelectItem>
                <SelectItem value="Stok Rendah">Surabaya Store</SelectItem>
                <SelectItem value="Stok Habis">Medan Store</SelectItem>
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
                <SelectItem value="Tersedia">Tersedia</SelectItem>
                <SelectItem value="Stok Rendah">Stok Rendah</SelectItem>
                <SelectItem value="Stok Habis">Stok Habis</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Eye />
                Lihat
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
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main table */}
      <div className="rounded-md border border-gray-200 overflow-x-auto w-full">
        <Table className='min-w-full'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    className="cursor-pointer select-none whitespace-nowrap"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {({ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted() as string] ?? null)}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.column.id === 'action' ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="text-sm font-semibold text-gray-600">
                            <MoreHorizontal className="w-5 h-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-40 rounded-md shadow-lg bg-white">
                            <DropdownMenuCheckboxItem onCheckedChange={() => {}}>
                              Edit
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              className="text-red-600"
                              onCheckedChange={() => {}}
                            >
                              Delete
                            </DropdownMenuCheckboxItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : cell.column.id === 'status' ? (
                        <Badge
                          variant={
                            cell.getValue() === 'Tersedia'
                              ? 'default'
                              : cell.getValue() === 'Stok Rendah'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {cell.getValue()}
                        </Badge>
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div>
          Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
        </div>
      </div>
    </div>
  );
}
