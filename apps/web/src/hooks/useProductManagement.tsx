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
import productManagementAPI from '@/lib/apis/dashboard/productManagement.api';
import { useSession } from '@/lib/auth/client';
import { genRandomString } from '@/lib/utils';
import { getValidationSchema } from '@/validations/product.validation';
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
import { ImageOff, MoreHorizontal } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
export default function UseProductManagement() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [previews, setPreviews] = useState<string[]>([]);
  const [mainIndex, setMainIndex] = useState<number>(0);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'Stok Tersedia' | 'Stok Rendah' | 'Stok Habis'
  >('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: session, isPending: isSessionLoading } = useSession();

  const user = session?.user;

  const {
    products,
    isLoading,
    fetchProducts: apiFetchProducts,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct: apiDeleteProduct,
  } = productManagementAPI();

  const { categories, fetchCategories } = categoryManagementAPI();

  const fetchProducts = useCallback(
    (
      pageIndex: number,
      pageSize: number,
      searchTerm: string,
      category: string,
      status: string,
    ) => {
      return apiFetchProducts(
        pageIndex,
        pageSize,
        searchTerm,
        category,
        status,
      ).then((json) => {
        if (json?.pagination) {
          setPageCount(json.pagination.totalPages);
        }
        return json;
      });
    },
    [apiFetchProducts],
  );

  useEffect(() => {
    fetchProducts(
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearchTerm,
      selectedCategory, 
      selectedStatus,
    );
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearchTerm,
    selectedCategory,
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
    fetchCategories(0, 50);
  }, []);
  useEffect(() => {
    fetchCategories(0, 50);
  }, []);
  const formik = useFormik({
    initialValues: {
      nama: '',
      deskripsi: '',
      harga: '',
      berat: '',
      sku: '',
      kategoriId: '',
      isActive: true,
      image: [],
      keptImages: [],
      mainIndex: 0,
    },
    validationSchema: getValidationSchema(),
    onSubmit: async (values, { resetForm }) => {
      let success = false;
      if (isEditMode && editingProductId) {
        success = await handleUpdateProduct(
          editingProductId,
          values,
          setIsProcessing,
        );
      } else {
        success = await handleCreateProduct(values, setIsProcessing);
      }
      if (success) {
        resetForm();
        const newSku = genRandomString().slice(0, 8);
        formik.setFieldValue('sku', newSku, false);
        setDialogOpen(false);
        fetchProducts(
          pagination.pageIndex,
          pagination.pageSize,
          debouncedSearchTerm,
          selectedCategory,
          selectedStatus,
        );
      }
    },
  });

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: 'mainImage',
        header: 'Gambar',
        accessorFn: (row) => row.images.find((img) => img.isMain),
        cell: ({ getValue }) => {
          const img = getValue();
          if (!img) {
            return (
              <Avatar className="h-32 w-32 overflow-hidden rounded-sm flex justify-center items-center">
                <ImageOff className="w-32 h-32 text-gray-400" />
              </Avatar>
            );
          }
          return (
            <Avatar className="h-32 w-32 overflow-hidden rounded-md">
              <AvatarImage src={img.imageUrl} alt="main product image" />
            </Avatar>
          );
        },
      },
      { accessorKey: 'name', header: 'Produk' },
      {
        accessorKey: 'category',
        header: 'Kategori',
        accessorFn: (row) => row.category?.name ?? '-',
        cell: ({ row }) => {
          return row.original.category?.name ?? '-';
        },
      },
      {
        accessorKey: 'price',
        header: 'Harga',
        cell: ({ row }) => {
          const { price } = row.original;
          const num = Number(price);
          return `Rp ${num.toLocaleString()}`;
        },
      },
      { accessorKey: 'sku', header: 'SKU' },
      {
        accessorKey: 'inventory',
        header: 'Stok',
        cell: ({ row }) => {
          const inventoryArray = row.original.inventory;

          if (user.role == 'ADMIN') {
            return inventoryArray?.[0]?.quantity ?? 0;
          }

          return inventoryArray.reduce((sum, inv) => sum + inv.quantity, 0);
        },
      },
      {
        id: 'status',
        header: 'Status',
        accessorFn: (row) => {
          const total =
            row.inventory?.reduce((s: number, inv) => s + inv.quantity, 0) ?? 0;

          const minStock =
            row.inventory?.reduce(
              (min: number, inv) => Math.min(min, inv.minStock),
              Infinity,
            ) ?? 0;

          if (total === 0) return 'Stok Habis';
          if (total < minStock) return 'Stok Rendah';
          return 'Stok Tersedia';
        },
        cell: ({ getValue }) => {
          const status = getValue<string>();
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
        accessorKey: 'aksi',
        header: 'Aksi',
        cell: ({ row }: any) => {
          const product = row.original;
          const [isAlertOpen, setIsAlertOpen] = useState(false);

          return (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger className="text-sm font-semibold text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40 rounded-md shadow-lg bg-white">
                  {user.role == 'SUPER' && (
                    <DropdownMenuCheckboxItem
                      onCheckedChange={() => {
                        setDialogOpen(true);
                        setEditingProductId(product.id);
                        setIsEditMode(true);
                        formik.setValues({
                          nama: product.name || '',
                          deskripsi: product.description || '',
                          harga: product.price || 0,
                          berat: product.weight || 0,
                          isActive: product.isActive || '',
                          sku: product.sku || '',
                          kategoriId: product.categoryId || '',
                          image: [],
                          keptImages: product.images.map(
                            (img: any) => img.imageUrl,
                          ), // ✅ include this
                          mainIndex:
                            product.images.findIndex(
                              (img: any) => img.isMain,
                            ) || 0, // ✅ optional
                        });

                        setPreviews(
                          product.images.map((img: any) => img.imageUrl),
                        );
                        const mainIdx = product.images.findIndex(
                          (img: any) => img.isMain,
                        );
                        setMainIndex(mainIdx >= 0 ? mainIdx : 0);
                      }}
                    >
                      Edit
                    </DropdownMenuCheckboxItem>
                  )}
                  <DropdownMenuCheckboxItem
                    onSelect={(e) => {
                      console.log('Detail handler fired');
                      setDialogOpen(true);

                      setIsEditMode(false);
                      setIsDetailMode(true);
                      setEditingProductId(product.id);
                      formik.setValues({
                        nama: product.name || '',
                        deskripsi: product.description || '',
                        harga: product.price || 0,
                        berat: product.weight || 0,
                        isActive: product.isActive || '',
                        sku: product.sku || '',
                        kategoriId: product.categoryId || '',
                        image: [],
                        keptImages: product.images.map(
                          (img: any) => img.imageUrl,
                        ),
                        mainIndex:
                          product.images.findIndex((img: any) => img.isMain) ||
                          0,
                      });

                      setPreviews(
                        product.images.map((img: any) => img.imageUrl),
                      );
                      const mainIdx = product.images.findIndex(
                        (img: any) => img.isMain,
                      );
                      setMainIndex(mainIdx >= 0 ? mainIdx : 0);
                    }}
                  >
                    Lihat Detail
                  </DropdownMenuCheckboxItem>
                  {user.role == 'SUPER' && (
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
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus produk?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah anda yakin untuk menghapus produk dengan nama "
                      <b>{product.name}</b>" secara permanen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        handleDeleteProduct(product.id, setIsProcessing);
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
    [user, formik, previews, mainIndex],
  );

  const table = useReactTable({
    data: products,
    columns,
    manualPagination: true,
    pageCount,
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (value: string) => {
    setSelectedStatus(
      value as 'all' | 'Stok Tersedia' | 'Stok Rendah' | 'Stok Habis',
    );

    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleCategoryFilter = (value: string) => {
    setSelectedCategory(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };
  const handleDeleteProduct = async (id: string, setIsProcessing) => {
    const ok = await apiDeleteProduct(id, setIsProcessing);
    if (ok) {
      await fetchProducts(
        pagination.pageIndex,
        pagination.pageSize,
        debouncedSearchTerm,
        selectedCategory,
        selectedStatus,
      );
    }
    return ok;
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory(''); // Set back to 'all'
    setSelectedStatus('');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  return {
    formik,
    columns,
    products,
    isLoading,
    fetchProducts,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    table,
    handleSearchChange,
    globalFilter,
    sorting,
    pagination,
    columnFilters,
    columnVisibility,
    dialogOpen,
    isEditMode,
    setDialogOpen,
    handleStatusFilter,
    categories,
    fetchCategories,
    handleCategoryFilter,
    setIsEditMode,
    setEditingProductId,
    previews,
    setPreviews,
    mainIndex,
    setMainIndex,
    isDetailMode,
    setIsDetailMode,
    isSessionLoading,
    user,
    selectedStatus,
    clearAllFilters,
    searchTerm,
    selectedCategory,
    isProcessing,
  };
}
