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
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedValueType, setSelectedValueType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const { data: session, isPending: isSessionLoading } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const user = session?.user;

  const fetchDiscounts = useCallback(
    (
      pageIndex: number,
      pageSize: number,
      search: string,
      type: string,
      valueType: string,
      status: string,
    ) => {
      return apiFetchDiscounts(
        pageIndex,
        pageSize,
        search,
        type,
        valueType,
        status,
      ).then((json) => {
        if (json?.pagination) {
          setPageCount(json.pagination.totalPages);
        }
        return json;
      });
    },
    [apiFetchDiscounts],
  );

  useEffect(() => {
    fetchDiscounts(
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearchTerm,
      selectedType,
      selectedValueType,
      selectedStatus,
    );
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearchTerm,
    selectedType,
    selectedValueType,
    selectedStatus,
  ]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((p) => ({ ...p, pageIndex: 0 })); // reset **once** after typing stops
    }, 1000); // ← 300ms debounce

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchStores();
  }, []);

  function toDateOnly(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
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
        success = await handleUpdateDiscount(
          editingDiscountId,
          values,
          setIsProcessing,
        );
      } else {
        success = await handleCreateDiscount(values, setIsProcessing);
      }

      if (success) {
        resetForm();
        setDialogOpen(false);
        fetchDiscounts(
          pagination.pageIndex,
          pagination.pageSize,
          debouncedSearchTerm,
          selectedType,
          selectedValueType,
          selectedStatus,
        );
      }
    },
  });
  const columns = useMemo<ColumnDef<Discount>[]>(() => {
    const cols: ColumnDef<Discount>[] = [];

    if (user?.role === 'SUPER') {
      cols.push({
        id: 'storeName',
        header: 'Toko',
        accessorFn: (row) => {
          if (!row.storeId) return 'Semua Toko';
          const store = stores.find((s) => s.id === row.storeId);
          return store?.name ?? 'Unknown Store';
        },
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
        accessorFn: (row) => {
          switch (row.type) {
            case 'NO_RULES_DISCOUNT':
              return 'Diskon Normal';
            case 'WITH_MAX_PRICE':
              return 'Diskon Syarat';
            case 'BUY_X_GET_Y':
              return 'Beli 1 Gratis 1';
            default:
              return row.type;
          }
        },
      },
      {
        id: 'tipe_nilai_diskon',
        header: 'Tipe Nilai',
        accessorFn: (row) => {
          // If the discount type is BUY_X_GET_Y (“Beli 1 Gratis 1”)
          // we show a dash instead of Persentase/Nominal
          if (row.type === 'BUY_X_GET_Y') return '-';
          return row.isPercentage ? 'Persentase' : 'Nominal';
        },
        cell: ({ row }) => {
          if (row.original.type === 'BUY_X_GET_Y') return '-';
          return row.original.isPercentage ? 'Persentase' : 'Nominal';
        },
        filterFn: 'equalsString',
      },
      {
        id: 'nilai_diskon',
        header: 'Nilai Diskon',
        accessorFn: (row) => row.value, // still needed for sorting
        cell: ({ row }) => {
          // If the discount type is Beli 1 Gratis 1, show a dash
          if (row.original.type === 'BUY_X_GET_Y') return '-';

          const num = Number(row.original.value);
          return row.original.isPercentage
            ? `${num.toLocaleString()}%`
            : `Rp ${num.toLocaleString()}`;
        },
      },
      {
        accessorKey: 'minPurchase',
        header: 'Min. Pembelian',
        cell: ({ getValue }) => {
          const v = Number(getValue<string>());
          return v > 0 ? `Rp ${v.toLocaleString()}` : '-';
        },
      },
      {
        accessorKey: 'maxDiscount',
        header: 'Potongan Maks.',
        cell: ({ getValue }) => {
          const v = Number(getValue<string>());
          return v > 0 ? `Rp ${v.toLocaleString()}` : '-';
        },
      },
      {
        accessorKey: 'startDate',
        header: 'Tanggal Mulai',
        cell: ({ getValue }) =>
          new Date(getValue<string>()).toLocaleDateString('id-ID'),
      },
      {
        accessorKey: 'endDate',
        header: 'Tanggal Kadaluwarsa',
        cell: ({ getValue }) =>
          new Date(getValue<string>()).toLocaleDateString('id-ID'),
      },
      {
        id: 'status',
        header: 'Status',
        accessorFn: (row) => {
          const toDateOnly = (d: Date) => (d.setHours(0, 0, 0, 0), d);
          const today = toDateOnly(new Date());
          const start = toDateOnly(new Date(row.startDate));
          const end = row.endDate ? toDateOnly(new Date(row.endDate)) : null;
          if (start > today) return 'Inaktif';
          if (end && end < today) return 'Kadaluwarsa';
          return 'Aktif';
        },
        cell: ({ getValue }) => (
          <Badge
            variant={
              getValue<string>() === 'Aktif'
                ? 'default'
                : getValue<string>() === 'Inaktif'
                  ? 'secondary'
                  : 'destructive'
            }
          >
            {getValue<string>()}
          </Badge>
        ),
        filterFn: 'equalsString',
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
                    <DropdownMenuCheckboxItem
                      onClick={() => {
                        setIsEditMode(true);
                        setEditingDiscountId(d.id);
                        setDialogOpen(true);
                        formik.setValues({
                          nama: d.name,
                          deskripsi: d.description,
                          toko: d.storeId ?? '',
                          tipe_diskon:
                            d.type === 'NO_RULES_DISCOUNT'
                              ? 'diskon_normal'
                              : d.type === 'WITH_MAX_PRICE'
                                ? 'diskon_syarat'
                                : 'bogo',
                          tipe_nilai_diskon: d.isPercentage
                            ? 'percentage'
                            : 'nominal',
                          nilai_diskon: String(d.value),
                          min_pembelian: String(d.minPurchase ?? ''),
                          potongan_maks: String(d.maxDiscount ?? ''),
                          tanggal_mulai: d.startDate.split('T')[0],
                          kadaluwarsa: d.endDate?.split('T')[0] ?? '',
                        });
                      }}
                    >
                      Edit
                    </DropdownMenuCheckboxItem>
                  )}
                  <DropdownMenuCheckboxItem
                    onSelect={() => {
                      setIsEditMode(false);
                      setIsDetailMode(true);
                      formik.setValues({
                        nama: d.name,
                        deskripsi: d.description,
                        toko: d.storeId ?? '',
                        tipe_diskon:
                          d.type === 'NO_RULES_DISCOUNT'
                            ? 'diskon_normal'
                            : d.type === 'WITH_MAX_PRICE'
                              ? 'diskon_syarat'
                              : 'bogo',
                        tipe_nilai_diskon: d.isPercentage
                          ? 'percentage'
                          : 'nominal',
                        nilai_diskon: String(d.value),
                        min_pembelian: String(d.minPurchase ?? ''),
                        potongan_maks: String(d.maxDiscount ?? ''),
                        tanggal_mulai: d.startDate.split('T')[0],
                        kadaluwarsa: d.endDate?.split('T')[0] ?? '',
                      });
                      setDialogOpen(true);
                    }}
                  >
                    Lihat Detail
                  </DropdownMenuCheckboxItem>
                  {user?.role === 'ADMIN' && (
                    <DropdownMenuCheckboxItem
                      className="text-red-600"
                      onClick={() => {
                        handleDeleteDiscount(d.id, setIsProcessing);
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
                      Apakah anda yakin untuk menghapus diskon “<b>{d.name}</b>
                      ”?
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
        },
      },
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
      columnVisibility,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);

  const handleStatusFilter = (value: string) => {
    setSelectedStatus(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleTypeFilter = (value: string) => {
    setSelectedType(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleTypeValueFilter = (value: string) => {
    setSelectedValueType(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleDeleteDiscount = async (id: string, setIsProcessing) => {
    const ok = await apiDeleteDiscount(id, setIsProcessing);
    if (ok) {
      await fetchDiscounts(
        pagination.pageIndex,
        pagination.pageSize,
        debouncedSearchTerm,
        selectedType,
        selectedValueType,
        selectedStatus,
      );
    }
    return ok;
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedStatus('');
    setSelectedValueType('');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
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
    clearAllFilters,
    selectedStatus,
    selectedType,
    selectedValueType,
    searchTerm,
    isProcessing,
  };
}
