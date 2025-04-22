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

export default function Category() {
  // Sample product data (using useMemo so it doesn't change on every render)
  const data = useMemo(
    () => [
      {
        id: 1,
        nama: 'Roti',
        deskripsi: 'Roti Sehat',
       
      },
      {
        id: 2,
        nama: 'Daging',
        deskripsi: 'Daging Pilihan',
       
      },
      {
        id: 3,
        nama: 'Susu & Telor',
        deskripsi: 'Langsung dari hewan',
        
      },
    ],
    []
  );

  // Define table columns (memoized)
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'nama', header: 'Nama' },
      { accessorKey: 'deskripsi', header: 'Deskripsi' },
     
      {
        accessorKey: 'aksi',
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
              <DropdownMenuCheckboxItem
                className="text-red-600"
                onCheckedChange={() => {}}
              >
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

  // Create the TanStack Table instance with a global filter function that
  // searches across all desired columns.
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
      // Search across all searchable columns
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

  // Handler for the status filter dropdown.
  // When "all" is selected, the filter on the status column is cleared.
  const handleStatusFilter = (value: string) => {
    if (value === 'all') {
      table.getColumn('status')?.setFilterValue(undefined);
    } else {
      table.getColumn('status')?.setFilterValue(value);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col gap-6 p-4">
        <Link href='/dashboard/products'>
        <div className='flex gap-2 text-gray-400'>
     <ChevronLeft className="w-6 h-6 " />
     Kembali
     </div>
        </Link>
    
      <div className='flex justify-end'>
 <Link href="/">
        

 </Link>
      </div>
      {/* Header with title and "Tambah Produk" modal */}
      <div className="flex justify-between items-center">
        <h1 className="sm:text-4xl text-2xl font-bold">Kategori</h1>
        <Button className="w-[150px]">
        <Plus className="w-4 h-4 mr-1" />
             Tambah Kategori
            </Button>
      </div>

      {/* Filter row: Global search, status filter, and column visibility toggler */}
      <div className="mb-4 flex  items-end justify-between gap-2 sm:gap-0">
        <div className="flex gap-2 ">
          <Input
            placeholder="Cari..."
            value={globalFilter}
            onChange={handleSearchChange}
            className="order-2 h-9 w-[140px] text-sm sm:w-[200px] sm:order-1"
          />
          
        </div>
      <div className='flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 '>
      
     
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
            {table.getAllColumns()
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
        <Table className='min-w-full'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
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
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
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
