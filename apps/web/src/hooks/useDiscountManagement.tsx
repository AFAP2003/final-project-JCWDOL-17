import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { discountManagementAPI } from '@/lib/apis/dashboard/discountManagement.api';
import storeManagementAPI from '@/lib/apis/dashboard/storeManagement.api';
import { useSession } from '@/lib/auth/client';
import { Discount } from '@/lib/interfaces/discountManagement.interface';
import { getValidationSchema } from '@/validations/discount.validation';
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
import { useFormik } from 'formik';
import { MoreHorizontal } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
export default function UseDiscountManagement() {
  const {
    discounts,
    isLoading,
    fetchDiscounts: apiFetchDiscounts,
    handleCreateDiscount,
    handleUpdateDiscount,
    handleDeleteDiscount: apiDeleteDiscount,
  } = discountManagementAPI();
  const { stores, fetchStores } = storeManagementAPI();
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const { data: session, isPending: isSessionLoading } = useSession();
  const user = session?.user;

  const fetchDiscounts = useCallback(
    (pageIndex: number, pageSize: number) => {
      return apiFetchDiscounts(pageIndex, pageSize).then((json) => {
        if (json?.pagination) {
          setPageCount(json.pagination.totalPages);
        }
        return json;
      });
    },
    [apiFetchDiscounts],
  );

  useEffect(() => {
    fetchDiscounts(pagination.pageIndex, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchStores();
  }, []);

  function toDateOnly(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  function getStatus(start: string, end?: string) {
    const today = toDateOnly(new Date());
    const s = toDateOnly(new Date(start));
    const e = end ? toDateOnly(new Date(end)) : null;

    if (s > today) return 'Inaktif';
    if (e && e < today) return 'Kadaluwarsa';
    return 'Aktif';
  }

  const formik = useFormik({
    initialValues: {
      nama: '',
      toko: '',
      deskripsi: '',
      tipe_diskon: '',
      tipe_nilai_diskon: '',
      nilai_diskon: '',
      min_pembelian: '',
      potongan_maks: '',
      tanggal_mulai: '',
      kadaluwarsa: '',
    },
    validationSchema: getValidationSchema(),
    onSubmit: async (values, { resetForm }) => {
      let success = false;

      if (isEditMode && editingDiscountId) {
        success = await handleUpdateDiscount(editingDiscountId, values);
      } else {
        success = await handleCreateDiscount(values);
      }

      if (success) {
        resetForm();
        setDialogOpen(false);
        fetchDiscounts(pagination.pageIndex, pagination.pageSize);
      }
    },
  });
  const columns = useMemo<ColumnDef<Discount>[]>(() => {
    const cols: ColumnDef<Discount>[] = [];

    // only SUPER sees the Toko column
    if (user?.role === 'SUPER') {
      cols.push({
        id: 'storeName',
        header: 'Toko',
        accessorFn: row => {
          if (!row.storeId) return 'Semua Toko';
          const store = stores.find(s => s.id === row.storeId);
          return store?.name ?? 'Unknown Store';
        }
      });
    }

    cols.push(
      {
        accessorKey: 'name',
        header: 'Nama',
      },
      {
        id: 'tipe_diskon',
        header: 'Tipe Diskon',
        accessorFn: row => {
          switch (row.type) {
            case 'NO_RULES_DISCOUNT': return 'Diskon Normal';
            case 'WITH_MAX_PRICE':    return 'Diskon Syarat';
            case 'BUY_X_GET_Y':       return 'Beli 1 Gratis 1';
            default:                  return row.type;
          }
        }
      },
      {
        id: 'tipe_nilai_diskon',
        header: 'Tipe Nilai',
        accessorFn: row => row.isPercentage ? 'Persentase' : 'Nominal',
        filterFn: 'equalsString'
      },
      {
        accessorKey: 'value',
        header: 'Nilai Diskon',
        cell: ({ row }) => {
          const num = Number(row.original.value);
          return row.original.isPercentage
            ? `${num.toLocaleString()}%`
            : `Rp ${num.toLocaleString()}`;
        }
      },
      {
        accessorKey: 'minPurchase',
        header: 'Min. Pembelian',
        cell: ({ getValue }) => {
          const v = Number(getValue<string>());
          return v > 0 ? `Rp ${v.toLocaleString()}` : '-';
        }
      },
      {
        accessorKey: 'maxDiscount',
        header: 'Potongan Maks.',
        cell: ({ getValue }) => {
          const v = Number(getValue<string>());
          return v > 0 ? `Rp ${v.toLocaleString()}` : '-';
        }
      },
      {
        accessorKey: 'startDate',
        header: 'Tanggal Mulai',
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString('id-ID')
      },
      {
        accessorKey: 'endDate',
        header: 'Tanggal Kadaluwarsa',
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString('id-ID')
      },
      {
        id: 'status',
        header: 'Status',
        accessorFn: row => {
          const toDateOnly = (d: Date) => (d.setHours(0,0,0,0), d);
          const today = toDateOnly(new Date());
          const start = toDateOnly(new Date(row.startDate));
          const end = row.endDate ? toDateOnly(new Date(row.endDate)) : null;
          if (start > today)     return 'Inaktif';
          if (end && end < today) return 'Kadaluwarsa';
          return 'Aktif';
        },
        cell: ({ getValue }) => (
          <Badge variant={
            getValue<string>() === 'Aktif' ? 'default'
            : getValue<string>() === 'Inaktif' ? 'secondary'
            : 'destructive'
          }>
            {getValue<string>()}
          </Badge>
        ),
        filterFn: 'equalsString'
      },
      {
        id: 'aksi',
        header: 'Aksi',
        cell: ({ row }) => {
          const d = row.original;
          const [open, setOpen] = useState(false);
          return (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreHorizontal />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {user?.role === 'ADMIN' && (
                    <DropdownMenuCheckboxItem onClick={() => {
                      setIsEditMode(true);
                      setEditingDiscountId(d.id);
                      setDialogOpen(true);
                      formik.setValues({
                        nama: d.name,
                        deskripsi: d.description,
                        toko: d.storeId ?? '',
                        tipe_diskon: d.type === 'NO_RULES_DISCOUNT'
                          ? 'diskon_normal'
                          : d.type === 'WITH_MAX_PRICE'
                          ? 'diskon_syarat'
                          : 'bogo',
                        tipe_nilai_diskon: d.isPercentage ? 'percentage' : 'nominal',
                        nilai_diskon: String(d.value),
                        min_pembelian: String(d.minPurchase ?? ''),
                        potongan_maks: String(d.maxDiscount ?? ''),
                        tanggal_mulai: d.startDate.split('T')[0],
                        kadaluwarsa: d.endDate?.split('T')[0] ?? '',
                      });
                    }}>
                      Edit
                    </DropdownMenuCheckboxItem>
                  )}
                  <DropdownMenuCheckboxItem onSelect={() => {
                    setIsEditMode(false);
                    setIsDetailMode(true);
                    formik.setValues({
                      nama: d.name,
                      deskripsi: d.description,
                      toko: d.storeId ?? '',
                      tipe_diskon: d.type === 'NO_RULES_DISCOUNT'
                        ? 'diskon_normal'
                        : d.type === 'WITH_MAX_PRICE'
                        ? 'diskon_syarat'
                        : 'bogo',
                      tipe_nilai_diskon: d.isPercentage ? 'percentage' : 'nominal',
                      nilai_diskon: String(d.value),
                      min_pembelian: String(d.minPurchase ?? ''),
                      potongan_maks: String(d.maxDiscount ?? ''),
                      tanggal_mulai: d.startDate.split('T')[0],
                      kadaluwarsa: d.endDate?.split('T')[0] ?? '',
                    });
                    setDialogOpen(true);
                  }}>
                    Lihat Detail
                  </DropdownMenuCheckboxItem>
                  {user?.role === 'ADMIN' && (
                    <DropdownMenuCheckboxItem className="text-red-600" 
                      onClick={() => {
                        handleDeleteDiscount(d.id);
                      }}
                    >
                      Hapus
                    </DropdownMenuCheckboxItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus diskon?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah anda yakin untuk menghapus diskon “<b>{d.name}</b>”?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={() => apiDeleteDiscount(d.id)}>
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          );
        }
      }
    );

    return cols;
  }, [user, stores, formik, apiDeleteDiscount]);


  const table = useReactTable({
    data: discounts,
    manualPagination: true,
    pageCount,
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
   globalFilterFn: (row, _col, filterValue) => {
  const q = String(filterValue).toLowerCase();

  // Create a searchObj with both raw and display values
  const searchObj = {
    name: row.original.name || '',
    description: row.original.description || '',
    tipe_diskon:
      row.original.type === 'NO_RULES_DISCOUNT'
        ? 'Diskon Normal'
        : row.original.type === 'WITH_MAX_PRICE'
        ? 'Diskon Syarat'
        : row.original.type === 'BUY_X_GET_Y'
        ? 'Beli 1 Gratis 1'
        : row.original.type || '',
    tipe_nilai_diskon: row.original.isPercentage ? 'Persentase' : 'Nominal',
    value: String(row.original.value ?? ''),
    minPurchase: String(row.original.minPurchase ?? ''),
    maxDiscount: String(row.original.maxDiscount ?? ''),
    // The key change: use the formatted value for searching
    startDate: new Date(row.original.startDate).toLocaleDateString('id-ID'),
    endDate: row.original.endDate
      ? new Date(row.original.endDate).toLocaleDateString('id-ID')
      : '',
    status: (() => {
      const toDateOnly = (d: Date) => (d.setHours(0, 0, 0, 0), d);
      const today = toDateOnly(new Date());
      const start = toDateOnly(new Date(row.original.startDate));
      const end = row.original.endDate
        ? toDateOnly(new Date(row.original.endDate))
        : null;
      if (start > today) return 'Inaktif';
      if (end && end < today) return 'Kadaluwarsa';
      return 'Aktif';
    })(),
    kode_voucher: row.original.kode_voucher ?? '',
    batas_penggunaan: String(row.original.batas_penggunaan ?? ''),
  };

  // For each key, check if the query matches the displayed value (case insensitive)
  return Object.values(searchObj).some((v) =>
    String(v).toLowerCase().includes(q),
  );
}
,
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

  const handleTypeFilter = (value: string) => {
    if (value === 'all')
      table.getColumn('tipe_diskon')?.setFilterValue(undefined);
    else table.getColumn('tipe_diskon')?.setFilterValue(value);
  };

  const handleTypeValueFilter = (value: string) => {
    if (value === 'all')
      table.getColumn('tipe_nilai_diskon')?.setFilterValue(undefined);
    else table.getColumn('tipe_nilai_diskon')?.setFilterValue(value);
  };

  const handleDeleteDiscount = async (id: string) => {
    const ok = await apiDeleteDiscount(id);
    if (ok) {
      await fetchDiscounts(pagination.pageIndex, pagination.pageSize);
    }
    return ok;
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
    stores,
    fetchStores,
    handleTypeFilter,
    handleTypeValueFilter,
    setIsEditMode,
    setEditingDiscountId,
    isDetailMode,
    setIsDetailMode,
    isSessionLoading,
    user,
  };
}
