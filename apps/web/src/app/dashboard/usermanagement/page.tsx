'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/shadcn/badge';
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

export default function UserManagement() {
  const data = useMemo(
    () => [
      {
        id: 1,
        nama_depan: 'Alice',
        nama_belakang: 'Johnson',
        email: 'alice@example.com',
        role: 'Store Admin',
        verifikasi: true,
      },
      {
        id: 2,
        nama_depan: 'John',
        nama_belakang: 'Johnson',
        email: 'john@example.com',
        role: 'User',
        verifikasi: false,
      },
      {
        id: 3,
        nama_depan: 'Alex',
        nama_belakang: 'Johnson',
        email: 'alex@example.com',
        role: 'User',
        verifikasi: true,
      },
    ],
    [],
  );

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'nama_depan', header: 'Nama Depan' },
      { accessorKey: 'nama_belakang', header: 'Nama Belakang' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'role', header: 'Role' },
      {
        accessorKey: 'verifikasi',
        header: 'Verifikasi',
        cell: ({ getValue }) => {
          const verified = getValue<boolean>();
          return (
            <Badge variant={verified ? 'default' : 'outline'}>
              {verified ? 'Terverifikasi' : 'Belum Terverifikasi'}
            </Badge>
          );
        },
      },
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
    [],
  );

  // Global filter state used for searching across all searchable columns
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
        String(row.getValue('nama_depan') ?? ''),
        String(row.getValue('nama_belakang') ?? ''),
        String(row.getValue('email') ?? ''),
        String(row.getValue('role') ?? ''),
      ];
      return cellValues.some((value) =>
        value.toLowerCase().includes(searchText),
      );
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

  // Handler for the verification filter dropdown.
  // When "all" is selected, clear the filter; "true" or "false" set a Boolean filter.
  const handleVerificationFilter = (value: string) => {
    if (value === 'all') {
      table.getColumn('verifikasi')?.setFilterValue(undefined);
    } else if (value === 'true') {
      table.getColumn('verifikasi')?.setFilterValue(true);
    } else if (value === 'false') {
      table.getColumn('verifikasi')?.setFilterValue(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col gap-6 p-4">
      {/* Header with title and "Tambah User" button (opens modal) */}
      <div className="flex justify-between items-center">
        <h1 className="sm:text-4xl text-2xl font-bold">Manajemen User</h1>
        <Dialog >
          <DialogTrigger asChild>
            <Button className="w-[150px]">
              <Plus className="w-4 h-4 mr-1" />
              Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah User Baru</DialogTitle>
              <DialogDescription>
                Tolong isi detail di bawah ini untuk tambah user baru.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label
                  htmlFor="first_name"
                  className="text-sm font-medium text-gray-700"
                >
                  Nama Depan
                </label>
                <Input id="first_name" placeholder="Masukkan nama depan" />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="last_name"
                  className="text-sm font-medium text-gray-700"
                >
                  Nama Belakang
                </label>
                <Input id="last_name" placeholder="Masukkan nama belakang" />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <Input id="email" placeholder="contoh@email.com" type="email" />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="role"
                  className="text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <Select>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                    <SelectLabel>Role</SelectLabel>
                      <SelectItem value="Store Admin">Store Admin</SelectItem>
                      <SelectItem value="User">User</SelectItem>
                      </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className='mt-2 sm:mt-0'>Cancel</Button>
              <Button type="submit" >Tambah User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter row: Global search, verification filter, and column visibility toggler */}
      <div className="mb-4 flex items-end justify-between gap-2 sm:gap-0">
        <div className="flex gap-2 ">
          <Input
            placeholder="Cari..."
            value={globalFilter}
            onChange={handleSearchChange}
            className="order-2 h-9 w-[140px] text-sm sm:w-[200px] sm:order-1"
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 ">
        <Select onValueChange={handleVerificationFilter} defaultValue="all">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Verifikasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Pilih Role</SelectLabel>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="true">User</SelectItem>
                <SelectItem value="false">Store Admin</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select onValueChange={handleVerificationFilter} defaultValue="all">
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Pilih Verifikasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Pilih Verifikasi</SelectLabel>
                <SelectItem value="all">Semua Verifikasi</SelectItem>
                <SelectItem value="true">Terverifikasi</SelectItem>
                <SelectItem value="false">Belum Terverifikasi</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        
          <DropdownMenu modal={true}>
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
                    {typeof column.columnDef.header === 'string'
                      ? column.columnDef.header
                      : flexRender(
                          column.columnDef.header,
                          column.getContext(),
                        )}
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
                      header.getContext(),
                    )}
                    {{ asc: ' 🔼', desc: ' 🔽' }[
                      header.column.getIsSorted() as string
                    ] ?? null}
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
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
          Halaman {table.getState().pagination.pageIndex + 1} dari{' '}
          {table.getPageCount()}
        </div>
      </div>
    </div>
  );
}
