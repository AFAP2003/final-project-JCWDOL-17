'use client';

import { useState } from 'react';
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

import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

import {
  Plus,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// 1) Sample discount data (maps to your "Discounts" table structure)
// ---------------------------------------------------------------------------
type Discount = {
  discount_id: number;         // PK (not displayed in table, just in data)
  nama_diskon: string;
  tipe_diskon: string;         // e.g. "percentage", "nominal", "bogo"
  mode_diskon: string;         // e.g. "cart", "product", "shipping"
  nilai_diskon: number;        // numeric discount value
  min_pembelian: number;       // if needed, can be 0 if no minimum
  potongan_maks?: number;      // e.g. limit for percentage discount
  kode_voucher?: string;       // can be null or empty
  batas_penggunaan?: number;   // can be null or 0 if unlimited
  kadaluwarsa?: string;        // can be null
};

const discountData: Discount[] = [
  {
    discount_id: 1,
    nama_diskon: 'Diskon Lebaran',
    tipe_diskon: 'percentage',
    mode_diskon: 'Keranjang',
    nilai_diskon: 15,
    min_pembelian: 0,
    potongan_maks: 50000,
    kode_voucher: '',
    batas_penggunaan: 100,
    kadaluwarsa: '2025-06-30',
  },
  {
    discount_id: 2,
    nama_diskon: 'Gratis Ongkir',
    tipe_diskon: 'nominal',
    mode_diskon: 'shipping',
    nilai_diskon: 20000,
    min_pembelian: 100000,
    potongan_maks: 0,
    kode_voucher: 'ONGKIRHEMAT',
    batas_penggunaan: 50,
    kadaluwarsa: '2024-12-31',
  },
  {
    discount_id: 3,
    nama_diskon: 'Beli 1 Gratis 1',
    tipe_diskon: 'bogo',
    mode_diskon: 'product',
    nilai_diskon: 100, // 100% for BOGO
    min_pembelian: 0,
    potongan_maks: 0,
    kode_voucher: '',
    batas_penggunaan: 999,
    kadaluwarsa: '2026-01-01',
  },
];

// ---------------------------------------------------------------------------
// 2) Utility function: derive "Aktif" vs "Kadaluwarsa" from expiration date
// ---------------------------------------------------------------------------
function getDiscountStatus(expirationDate?: string): 'Aktif' | 'Kadaluwarsa' | 'Tidak Ada' {
  if (!expirationDate) return 'Tidak Ada';
  const now = new Date();
  const exp = new Date(expirationDate);
  return exp >= now ? 'Aktif' : 'Kadaluwarsa';
}

// ---------------------------------------------------------------------------
// 3) Table columns (TanStack Table). Mapped to the data fields plus a derived status column.
// ---------------------------------------------------------------------------
const columns: ColumnDef<Discount>[] = [
  {
    accessorKey: 'nama_diskon',
    header: 'Nama Diskon',
  },
  {
    id: 'tipe_diskon', // use an ID if you don't want to override the raw accessor
    header: 'Tipe',
    // Use accessorFn to return the translated string
    accessorFn: (row) => {
      if (row.tipe_diskon === 'percentage') return 'Persentase';
      if (row.tipe_diskon === 'nominal') return 'Nominal';
      if (row.tipe_diskon === 'bogo') return 'BOGO';
      return row.tipe_diskon;
    },
    cell: ({ getValue }) => getValue(),
  },
  
  {
    accessorKey: 'mode_diskon',
    header: 'Mode',
    // Show mode as "Cart", "Produk", or "Ongkir"
    cell: ({ getValue }) => {
      const mode = getValue<string>();
      if (mode === 'cart') return 'Cart';
      if (mode === 'product') return 'Produk';
      if (mode === 'shipping') return 'Ongkir';
      return mode;
    },
  },
  {
    accessorKey: 'nilai_diskon',
    header: 'Nilai Diskon',
    // For percentage, show %, for nominal show currency, for bogo show text
    cell: ({ row }) => {
      const { tipe_diskon, nilai_diskon } = row.original;
      if (tipe_diskon === 'percentage') {
        return `${nilai_diskon}%`;
      } else if (tipe_diskon === 'nominal') {
        return `Rp ${nilai_diskon.toLocaleString()}`;
      } else if (tipe_diskon === 'bogo') {
        return 'Beli 1 Gratis 1';
      }
      return nilai_diskon;
    },
  },
  {
    accessorKey: 'min_pembelian',
    header: 'Min. Pembelian',
    cell: ({ getValue }) => {
      const val = getValue<number>();
      return val > 0 ? `Rp ${val.toLocaleString()}` : '-';
    },
  },
  {
    accessorKey: 'potongan_maks',
    header: 'Potongan Maks.',
    cell: ({ getValue }) => {
      const val = getValue<number>();
      return val && val > 0 ? `Rp ${val.toLocaleString()}` : '-';
    },
  },
  {
    accessorKey: 'kode_voucher',
    header: 'Kode Voucher',
    cell: ({ getValue }) => {
      const code = getValue<string>();
      return code ? code : '-';
    },
  },
  {
    accessorKey: 'batas_penggunaan',
    header: 'Batas Penggunaan',
    cell: ({ getValue }) => {
      const limit = getValue<number>();
      return limit && limit > 0 ? limit : 'Tidak Terbatas';
    },
  },
  {
    id: 'status',
    header: 'Status',
    // Add an accessorFn to return the actual text value for filtering.
    accessorFn: (row) => getDiscountStatus(row.kadaluwarsa),
    cell: ({ getValue }) => {
      const status = getValue<string>();
      return (
        <Badge variant={status === 'Aktif' ? 'default' : 'destructive'}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'kadaluwarsa',
    header: 'Kadaluwarsa',
    cell: ({ getValue }) => {
      const val = getValue<string>();
      return val || '-';
    },
  },
  {
    id: 'aksi',
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
];

// ---------------------------------------------------------------------------
// 4) Main Discount Management component
// ---------------------------------------------------------------------------
export default function DiscountManagement() {
  // Global filter state: used for searching across all columns.
  const [globalFilter, setGlobalFilter] = useState('');

  // Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // --- New state variables for the "Tambah Diskon" form --- //
  const [discountName, setDiscountName] = useState('');
  const [discountType, setDiscountType] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState('');
  const [maxDiscountValue, setMaxDiscountValue] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  // Create the TanStack Table instance with global filtering.
  const table = useReactTable({
    data: discountData,
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
    // Global filter function: searches across all relevant discount columns.
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchText = String(filterValue).toLowerCase();
      const cellValues = [
        String(row.getValue('nama_diskon') ?? ''),
        String(row.getValue('tipe_diskon') ?? ''),
        String(row.getValue('mode_diskon') ?? ''),
        String(row.getValue('nilai_diskon') ?? ''),
        String(row.getValue('min_pembelian') ?? ''),
        String(row.getValue('potongan_maks') ?? ''),
        String(row.getValue('kode_voucher') ?? ''),
        String(row.getValue('batas_penggunaan') ?? ''),
        String(row.getValue('kadaluwarsa') ?? ''),
      ];
      return cellValues.some((value) => value.toLowerCase().includes(searchText));
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Handler for the global search input.
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(e.target.value);
  };

  // Handler for the status filter dropdown.
  const handleStatusFilter = (value: string) => {
    if (value === 'all') {
      table.getColumn('status')?.setFilterValue(undefined);
    } else {
      table.getColumn('status')?.setFilterValue(value);
    }
  };

  // Handler for creating a new discount.
  const handleCreateDiscount = () => {
    // Add your discount creation logic here.
    console.log(
      'Creating discount:',
      discountName,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountValue,
      voucherCode,
      usageLimit,
      expirationDate
    );
    // Reset the form fields after creation:
    setDiscountName('');
    setDiscountType('');
    setDiscountValue('');
    setMinPurchaseAmount('');
    setMaxDiscountValue('');
    setVoucherCode('');
    setUsageLimit('');
    setExpirationDate('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col gap-6 p-4">
      {/* Header with title and "Tambah Diskon" button */}
      <div className="flex justify-between items-center">
        <h1 className="sm:text-4xl text-2xl font-bold">Manajemen Diskon</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-[150px]">
              <Plus className="w-4 h-4 mr-1" />
              Tambah Diskon
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Tambah Diskon Baru</DialogTitle>
              <DialogDescription>
                Silakan isi detail di bawah ini untuk menambah diskon.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Nama Diskon */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nama Diskon
                </label>
                <Input
                  value={discountName}
                  onChange={(e) => setDiscountName(e.target.value)}
                  placeholder="Contoh: Diskon Tahun Baru"
                />
              </div>

              {/* Tipe Diskon */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tipe Diskon
                </label>
                <Select onValueChange={setDiscountType} defaultValue="">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih tipe diskon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tipe</SelectLabel>
                      <SelectItem value="percentage">Persentase</SelectItem>
                      <SelectItem value="nominal">Nominal</SelectItem>
                      <SelectItem value="bogo">BOGO</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Nilai Diskon */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nilai Diskon
                </label>
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="Contoh: 15 (untuk 15%) atau 20000 (untuk Rp 20.000)"
                />
              </div>

              {/* Minimal Pembelian */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Minimal Pembelian
                </label>
                <Input
                  type="number"
                  value={minPurchaseAmount}
                  onChange={(e) => setMinPurchaseAmount(e.target.value)}
                  placeholder="Contoh: 50000 (untuk Rp 50.000)"
                />
              </div>

              {/* Potongan Maksimal */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Potongan Maksimal
                </label>
                <Input
                  type="number"
                  value={maxDiscountValue}
                  onChange={(e) => setMaxDiscountValue(e.target.value)}
                  placeholder="Contoh: 30000 (untuk Rp 30.000)"
                />
              </div>

              {/* Kode Voucher */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Kode Voucher
                </label>
                <Input
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="Kosongkan jika tidak ada"
                />
              </div>

              {/* Batas Penggunaan */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Batas Penggunaan
                </label>
                <Input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="0 = tidak terbatas"
                />
              </div>

              {/* Tanggal Kadaluarsa */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tanggal Kadaluarsa
                </label>
                <Input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleCreateDiscount}>Tambah Diskon</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <DropdownMenu modal={false} >
         <div className='hidden lg:hidden md:flex justify-end'>
         <DropdownMenuTrigger asChild >
              <Button variant="outline" className="ml-auto lg">
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
         </div>
          </DropdownMenu>

      {/* Filter row: global search, status filter dropdown, and column visibility toggler */}
      <div className="mb-4 flex  items-end justify-between  sm:gap-0">
        <div className="flex flex-col gap-2 sm:flex-row ">
          <Input
            placeholder="Cari..."
            value={globalFilter}
            onChange={handleSearchChange}
            className="order-2 h-9 w-[140px] text-sm sm:w-[200px] sm:order-1"
          />
        </div>
        <div className="flex flex-col-reverse lg:flex-row gap-2 md:gap-2 sm:gap-4 ">
        <Select onValueChange={handleStatusFilter} defaultValue="all">
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Pilih Tipe</SelectLabel>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="Aktif">Persentase</SelectItem>
                <SelectItem value="Kadaluwarsa">Nominal </SelectItem>
                <SelectItem value="Tidak Ada">BOGO</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        <Select onValueChange={handleStatusFilter} defaultValue="all">
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Pilih Mode</SelectLabel>
                <SelectItem value="all">Semua Mode</SelectItem>
                <SelectItem value="Aktif">Keranjang</SelectItem>
                <SelectItem value="Kadaluwarsa">Ongkir</SelectItem>
                <SelectItem value="Tidak Ada">Produk</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
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
          <DropdownMenu modal={false} >
         <div className='md:hidden lg:block flex justify-end'>
         <DropdownMenuTrigger asChild >
              <Button variant="outline" className="ml-auto lg">
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
         </div>
          </DropdownMenu>
        </div>
      </div>

      {/* Main discount table */}
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
