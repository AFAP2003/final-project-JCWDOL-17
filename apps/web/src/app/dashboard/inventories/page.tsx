'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
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
  ChevronLeft,
  ChevronRight,
  Plus,
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
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Inventory() {
  // Sample product data (using useMemo so it doesn't change on every render)
  const data = useMemo(
    () => [
      {
        id: 1,
        produk: 'Sunmi Beras Putih Premium 5 kg',
        // Provide an example image URL (replace with real URLs or leave empty for fallback)
        gambar: '',
        kategori: 'Sembako',
        harga: 'Rp 79.999',
        stok: '0',
        status: 'Stok Habis',
        toko: 'Jakarta Store',
        terakhir_Diperbarui: '2 Jam Lalu',
      },
      {
        id: 2,
        produk: 'Hati Ayam Organik Hona Farm',
        // No URL provided so fallback will be shown
        gambar: '',
        kategori: 'Sembako',
        harga: 'Rp 25.999',
        stok: '70',
        status: 'Tersedia',
        toko: 'Surabaya Store',
        terakhir_Diperbarui: '6 Jam Lalu',
      },
      {
        id: 3,
        produk: 'Healthy Republic Bumbu Marinasi Rendang 120 gram',
        gambar: '',
        kategori: 'Sembako',
        harga: 'Rp 38.500',
        stok: '10',
        status: 'Stok Rendah',
        toko: 'Medan Store',
        terakhir_Diperbarui: '1 Hari Lalu',
      },
    ],
    []
  );

  // Table columns definition
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      {
        accessorKey: 'gambar',
        header: 'Gambar',
        // Use DaisyUI avatar styling (here we make it rectangular)
        cell: ({ getValue }) => {
          const imageUrl = getValue<string>();
          return (
            <div className="avatar">
              <div className="w-[150px] h-[100px] rounded-md">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Product Image"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200 rounded-md text-sm text-gray-500">
                    NA
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      { accessorKey: 'produk', header: 'Produk' },
      { accessorKey: 'toko', header: 'Toko' },
      { accessorKey: 'kategori', header: 'Kategori' },
      { accessorKey: 'harga', header: 'Harga' },
      { accessorKey: 'stok', header: 'Stok' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue<string>();
          return (
            <Badge
              variant={
                status === 'Tersedia'
                  ? 'default'
                  : status === 'Stok Rendah'
                  ? 'secondary'
                  : status === 'Stok Habis'
                  ? 'destructive'
                  : 'default'
              }
            >
              {status}
            </Badge>
          );
        },
      },
      { accessorKey: 'terakhir_Diperbarui', header: 'Terakhir Diperbarui' },
      {
        accessorKey: 'action',
        header: 'Aksi',
        cell: () => (
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm font-semibold text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 rounded-md shadow-lg bg-white">
              <DropdownMenuCheckboxItem onCheckedChange={() => {}}>
                Edit
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem className="text-red-600" onCheckedChange={() => {}}>
                Delete
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  // Global filter state (search text)
  const [globalFilter, setGlobalFilter] = useState('');
  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Create the TanStack Table instance with global filtering
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchText = String(filterValue).toLowerCase();
      const cellValues = [
        String(row.getValue('id') ?? ''),
        String(row.getValue('produk') ?? ''),
        String(row.getValue('kategori') ?? ''),
        String(row.getValue('harga') ?? ''),
        String(row.getValue('stok') ?? ''),
        String(row.getValue('status') ?? ''),
      ];
      return cellValues.some((value) => value.toLowerCase().includes(searchText));
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Handler for the global search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(e.target.value);
  };

  // Handler for the status filter dropdown
  const handleStatusFilter = (value: string) => {
    if (value === 'all') {
      table.getColumn('status')?.setFilterValue(undefined);
    } else {
      table.getColumn('status')?.setFilterValue(value);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col gap-6 p-4">
      
      {/* Header with title and "Tambah Produk" modal */}
      <div className="flex justify-between items-center">
        <h1 className="sm:text-4xl text-2xl font-bold">Manajemen Invetaris</h1>
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

      {/* Filter row */}
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
          <Select onValueChange={handleStatusFilter} defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Filter Status</SelectLabel>
                <SelectItem value="all">Semua Toko</SelectItem>
                <SelectItem value="Jakarta Store">Jakarta Store</SelectItem>
                <SelectItem value="Surabaya Store">Surabaya Store</SelectItem>
                <SelectItem value="Medan Store">Medan Store</SelectItem>
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
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="true">Buah & Sayur</SelectItem>
                <SelectItem value="false">Susu & Telor</SelectItem>
                <SelectItem value="false">Roti</SelectItem>
                <SelectItem value="false">Daging</SelectItem>
                <SelectItem value="false">Lainnya</SelectItem>
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

      {/* Main table */}
      <div className="rounded-md border border-gray-200 overflow-x-auto w-full">
        <Table className="min-w-full">
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
                    {flexRender(header.column.columnDef.header, header.getContext())}
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
