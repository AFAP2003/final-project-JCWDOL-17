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
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { categoryManagementAPI } from '@/lib/apis/dashboard/categoryManagement.api';
import { inventoryManagementAPI } from '@/lib/apis/dashboard/inventoryManagement.api';
import productManagementAPI from '@/lib/apis/dashboard/productManagement.api';
import storeManagementAPI from '@/lib/apis/dashboard/storeManagement.api';
import { getValidationSchema } from '@/validations/inventory.validation';
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
import { ImageOff, MoreHorizontal } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function UseInventoryManagement() {
  const {
    inventories,
    isLoading,
    fetchInventories: apiFetchInventories,
    handleCreateInventory,
    handleUpdateInventory,
    handleDeleteInventory: apiDeleteInventory,
  } = inventoryManagementAPI();

  const { stores, fetchStores } = storeManagementAPI();
  const { categories, fetchCategories } = categoryManagementAPI();
  const { products, fetchProducts } = productManagementAPI();
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(
    null,
  );
  const [pageCount, setPageCount] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDetailMode, setIsDetailMode] = useState(false);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'gambar',
        header: 'Gambar',
        cell: ({ row }) => {
          const mainImg = row.original.product.images.find((img) => img.isMain);
          const imageUrl = mainImg?.imageUrl;
          return (
            <div>
              {imageUrl ? (
                <Avatar className="h-32 w-32 overflow-hidden rounded-md">
                  <AvatarImage src={imageUrl} alt="main product image" />
                </Avatar>
              ) : (
                <Avatar className="h-32 w-32 overflow-hidden rounded-sm flex justify-center items-center">
                  <ImageOff className="w-32 h-32 text-gray-400" />
                </Avatar>
              )}
            </div>
          );
        },
      },
      {
        header: 'Produk',
        cell: ({ row }) => row.original.product?.name ?? '-',
      },
      {
        id: 'category',
        header: 'Kategori',
        accessorFn: (row) => row.product?.category?.name ?? '',
        cell: ({ row }) => row.original.product?.category?.name ?? '-',
      },
      {
        id: 'store',
        header: 'Toko',
        accessorFn: (row) => row.store?.name ?? '',
        cell: ({ row }) => row.original.store?.name ?? '-',
      },

      {
        header: 'Harga',
        cell: ({ row }) => {
          const { price } = row.original.product;
          const num = Number(price);
          return `Rp ${num.toLocaleString()}`;
        },
      },
      {
        header: 'Stok',
        cell: ({ row }) => row.original.quantity ?? '0',
      },
      {
        id: 'status',
        header: 'Status',
        accessorFn: (row) => {
          const { quantity, minStock } = row;
          if (quantity === 0) return 'Stok Habis';
          if (quantity <= minStock) return 'Stok Rendah';
          return 'Stok Tersedia';
        },
        cell: ({ row }) => {
          const quantity = row.original.quantity;
          const minStock = row.original.minStock;

          let status = '';
          if (quantity === 0) {
            status = 'Stok Habis';
          } else if (quantity <= minStock) {
            status = 'Stok Rendah';
          } else {
            status = 'Stok Tersedia';
          }

          return (
            <Badge
              variant={
                status === 'Stok Tersedia'
                  ? 'default'
                  : status === 'Stok Rendah'
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {status}
            </Badge>
          );
        },
      },
      {
        header: 'Terakhir Diperbarui',
        cell: ({ row }) => {
          const date = new Date(row.original.updatedAt);
          return date.toLocaleString('id-ID');
        },
      },
      {
        header: 'Aksi',
        cell: ({ row }) => {
          const inventory = row.original;
          const [isAlertOpen, setIsAlertOpen] = useState(false);

          return (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger className="text-sm font-semibold text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40 rounded-md shadow-lg bg-white">
                  <DropdownMenuCheckboxItem
                    onCheckedChange={() => {
                      setDialogOpen(true);
                      setEditingInventoryId(inventory.id);
                      setIsEditMode(true);
                      formik.setValues({
                        produk: inventory.productId,
                        toko: inventory.storeId,
                        tambah: '',
                        kurangi: '',
                        minimal: inventory.minStock,
                        mode: 'tambah',
                      });
                    }}
                  >
                    Edit
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    onCheckedChange={() => {
                      setIsEditMode(false);
                      setIsDetailMode(true);
                      formik.setValues({
                        produk: inventory.productId,
                        toko: inventory.storeId,
                        tambah: '',
                        kurangi: '',
                        minimal: inventory.minStock,
                        mode: 'tambah',
                      });

                      setDialogOpen(true);
                    }}
                  >
                    Lihat Detail
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuCheckboxItem
                    className="text-red-600"
                    onCheckedChange={(checked) => {
                      if (checked) {
                        // Close dropdown and open alert manually
                        setTimeout(() => setIsAlertOpen(true), 100);
                      }
                    }}
                  >
                    Delete
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus inventaris?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah anda yakin untuk menghapus inventaris dengan nama "
                      <b>{inventory.product.name}</b>" secara permanen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        handleDeleteInventory(inventory.id);
                      }}
                    >
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          );
        },
      },
    ],
    [],
  );

  const fetchInventories = useCallback(
    (pageIndex: number, pageSize: number) => {
      return apiFetchInventories(pageIndex, pageSize).then((json) => {
        if (json?.pagination) {
          setPageCount(json.pagination.totalPages);
        }
        return json;
      });
    },
    [apiFetchInventories],
  );

  useEffect(() => {
    fetchInventories(pagination.pageIndex, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchStores();
    fetchCategories(0, 50);
    fetchProducts(0, 50);
  }, []);

  const formik = useFormik({
    initialValues: {
      produk: '',
      toko: '',
      mode: 'tambah' as 'tambah' | 'kurangi',
      tambah: '',
      kurangi: '',
      minimal: '',
    },

    validationSchema: getValidationSchema(),

    onSubmit: async (values, { resetForm }) => {
      let success = false;

      if (isEditMode && editingInventoryId) {
        success = await handleUpdateInventory(editingInventoryId, values);
      } else {
        success = await handleCreateInventory(values);
      }

      if (success) {
        resetForm();
        setDialogOpen(false);
        fetchInventories(pagination.pageIndex, pagination.pageSize);
      }
    },
  });

  const table = useReactTable({
    data: inventories,
    columns,
    manualPagination: true,
    pageCount,
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

      const inventory = row.original;

      let status = '';
      if (inventory.quantity === 0) {
        status = 'Stok Habis';
      } else if (inventory.quantity <= inventory.minStock) {
        status = 'Stok Rendah';
      } else {
        status = 'Stok Tersedia';
      }

      const cellValues = [
        String(inventory.id ?? ''),
        String(inventory.product?.name ?? ''),
        String(inventory.product?.category?.name ?? ''),
        String(inventory.product?.price ?? ''),
        String(inventory.store?.name ?? ''),
        String(inventory.quantity ?? ''),
        status,
        new Date(inventory.updatedAt).toLocaleString('id-ID'),
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(e.target.value);
  };

  const handleStatusFilter = (value: string) => {
    if (value === 'all') {
      table.getColumn('status')?.setFilterValue(undefined);
    } else {
      table.getColumn('status')?.setFilterValue(value);
    }
  };

  const handleStoreFilter = (value: string) => {
    table
      .getColumn('store')
      ?.setFilterValue(value === 'all' ? undefined : value);
  };

  const handleCategoryFilter = (value: string) => {
    table
      .getColumn('category')
      ?.setFilterValue(value === 'all' ? undefined : value);
  };

  const handleDeleteInventory = async (id: string) => {
    const ok = await apiDeleteInventory(id);
    if (ok) {
      await fetchInventories(pagination.pageIndex, pagination.pageSize);
    }
    return ok;
  };

  return {
    table,
    handleSearchChange,
    handleStatusFilter,
    inventories,
    isLoading,
    fetchInventories,
    handleCreateInventory,
    handleDeleteInventory,
    handleUpdateInventory,
    globalFilter,
    sorting,
    pagination,
    columnFilters,
    columnVisibility,
    isEditMode,
    editingInventoryId,
    dialogOpen,
    setDialogOpen,
    columns,
    formik,
    stores,
    fetchStores,
    categories,
    fetchCategories,
    fetchProducts,
    products,
    handleStoreFilter,
    handleCategoryFilter,
    setIsEditMode,
    setEditingInventoryId,
    isDetailMode,
    setIsDetailMode,
  };
}
