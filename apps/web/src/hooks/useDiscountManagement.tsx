import { Badge } from '@/components/ui/badge';
import { discountManagementAPI } from '@/lib/apis/dashboard/discountManagement.api';
import { Discount } from '@/lib/interfaces/discountManagement.interface';
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import * as Yup from 'yup';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';

import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useFormik } from 'formik';
export default function UseDiscountManagement() {
  const {
    discounts,
    isLoading,
    fetchDiscounts,
    handleCreateDiscount,
    handleUpdateDiscount,
    handleDeleteDiscount,
  } = discountManagementAPI();
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const columns: ColumnDef<Discount>[] = [
    { accessorKey: 'nama_diskon', header: 'Nama Diskon' },
    {
      id: 'tipe_diskon',
      header: 'Tipe',
      accessorFn: (row) =>
        row.tipe_diskon === 'percentage'
          ? 'Persentase'
          : row.tipe_diskon === 'nominal'
            ? 'Nominal'
            : 'BOGO',
      cell: ({ getValue }) => getValue(),
    },
    {
      accessorKey: 'mode_diskon',
      header: 'Mode',
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
      cell: ({ row }) => {
        const { tipe_diskon, nilai_diskon } = row.original;
        if (tipe_diskon === 'percentage') return `${nilai_diskon}%`;
        if (tipe_diskon === 'nominal')
          return `Rp ${nilai_diskon.toLocaleString()}`;
        if (tipe_diskon === 'bogo') return 'Beli 1 Gratis 1';
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
      cell: ({ getValue }) => getValue<string>() || '-',
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
      accessorFn: (row) => getStatus(row.kadaluwarsa),
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
      cell: ({ getValue }) => getValue<string>() || '-',
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
            <DropdownMenuCheckboxItem>Edit</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem className="text-red-600">
              Delete
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const formik = useFormik({
    initialValues: {
      nama_diskon: '',
      tipe_diskon: '',
      nilai_diskon: '',
      min_pembelian: '',
      potongan_maks: '',
      kode_voucher: '',
      batas_penggunaan: '',
      kadaluwarsa: '',
    },
    validationSchema: Yup.object({
      nama_diskon: Yup.string().required('Nama wajib diisi'),
      tipe_diskon: Yup.string().required('Tipe wajib dipilih'),
      nilai_diskon: Yup.number()
        .typeError('Masukkan angka')
        .positive()
        .required(),
      min_pembelian: Yup.number().typeError('Masukkan angka').min(0).nullable(),
      potongan_maks: Yup.number().typeError('Masukkan angka').min(0).nullable(),
      kode_voucher: Yup.string().nullable(),
      batas_penggunaan: Yup.number()
        .typeError('Masukkan angka')
        .min(0)
        .nullable(),
      kadaluwarsa: Yup.date().nullable(),
    }),
    onSubmit: (vals, { resetForm }) => {
      console.log('CREATE DISCOUNT', vals); // put API call here
      resetForm();
    },
  });

  const table = useReactTable({
    data: discounts,
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
    globalFilterFn: (row, _c, v) =>
      [
        'nama_diskon',
        'tipe_diskon',
        'mode_diskon',
        'nilai_diskon',
        'min_pembelian',
        'potongan_maks',
        'kode_voucher',
        'batas_penggunaan',
        'kadaluwarsa',
      ].some((k) =>
        String(row.getValue(k) ?? '')
          .toLowerCase()
          .includes(String(v).toLowerCase()),
      ),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setGlobalFilter(e.target.value);

  const handleStatusFilter = (value: string) => {
    if (value === 'all') table.getColumn('status')?.setFilterValue(undefined);
    else table.getColumn('status')?.setFilterValue(value);
  };

  return {
    handleSearchChange,
    handleStatusFilter,
    table,
    discounts,
    isLoading,
    fetchDiscounts,
    handleCreateDiscount,
    handleDeleteDiscount,
    handleUpdateDiscount,
    globalFilter,
    sorting,
    pagination,
    columnFilters,
    columnVisibility,
    isEditMode,
    editingDiscountId,
    dialogOpen,
    setDialogOpen,
    columns,
    formik,
  };
}
