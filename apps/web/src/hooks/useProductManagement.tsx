import productManagementAPI from '@/lib/apis/dashboard/productManagement.api';
import { genRandomString } from '@/lib/utils';
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, ImageOff } from 'lucide-react';
import { categoryManagementAPI } from '@/lib/apis/dashboard/categoryManagement.api';
import { getValidationSchema } from '@/validations/product.validation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  const [previews, setPreviews] = useState<string[]>([]); // ✅ typed
  const [mainIndex, setMainIndex] = useState<number>(0); // ✅ typed
  const [isDetailMode,setIsDetailMode] = useState(false)
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
    (pageIndex: number, pageSize: number) => {
      return apiFetchProducts(pageIndex, pageSize).then((json) => {
        if (json?.pagination) {
          setPageCount(json.pagination.totalPages);
        }
        return json;
      });
    },
    [apiFetchProducts],
  );

  useEffect(() => {
    fetchProducts(pagination.pageIndex, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

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
      keptImages: [], // ✅ Add this
      mainIndex: 0,
    },
    validationSchema: getValidationSchema(),
    onSubmit: async (values, { resetForm }) => {
      let success = false;
      if (isEditMode && editingProductId) {
        success = await handleUpdateProduct(editingProductId, values);
      } else {
        success = await handleCreateProduct(values);
      }
      if (success) {
        resetForm();
        const newSku = genRandomString().slice(0, 8);
        formik.setFieldValue('sku', newSku, false);
        setDialogOpen(false);
        fetchProducts(pagination.pageIndex, pagination.pageSize);
      }
    },
  });

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: 'mainImage',
        header: 'Gambar',
        // accessorFn now returns only the main image object (or undefined)
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
      // { accessorKey: 'description', header: 'Deskripsi' },
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
      // { accessorKey: 'weight', header: 'Berat (kg)' },
      {
        accessorKey: 'inventory',
        header: 'Stok',
        cell: ({ row }) => {
          const inventoryArray = row.original.inventory;

          const quantity = inventoryArray?.[0]?.quantity ?? 0;

          return quantity;
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
                          product.images.findIndex((img: any) => img.isMain) ||
                          0, // ✅ optional
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
                  <DropdownMenuCheckboxItem onCheckedChange={() => {
                               setIsEditMode(false)
                               setIsDetailMode(true)
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
                                  product.images.findIndex((img: any) => img.isMain) ||
                                  0, // ✅ optional
                              });
        
                              setPreviews(
                                product.images.map((img: any) => img.imageUrl),
                              );
                              const mainIdx = product.images.findIndex(
                                (img: any) => img.isMain,
                              );
                              setMainIndex(mainIdx >= 0 ? mainIdx : 0);
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
                    <AlertDialogTitle>Hapus produk?</AlertDialogTitle>
                    <AlertDialogDescription>
              Apakah anda yakin untuk menghapus produk dengan nama "<b>{product.name}</b>" secara permanen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        handleDeleteProduct(product.id);
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

  const table = useReactTable({
    data: products,
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
    globalFilterFn: (row, _col, filter) => {
      const search = String(filter).toLowerCase();
      const product = row.original; // Access the raw product object

      // Check relevant string/numeric fields
      const nameMatch = product.name?.toLowerCase().includes(search);
      const descriptionMatch = product.description
        ?.toLowerCase()
        .includes(search);
      const skuMatch = product.sku?.toLowerCase().includes(search);
      const priceMatch = String(product.price).includes(search); // Check price as string
      const weightMatch = String(product.weight).includes(search); // Check weight as string

      // Check category name
      const categoryNameMatch = product.category?.name
        ?.toLowerCase()
        .includes(search);

      // Check total inventory quantity
      const totalInventory =
        product.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) ?? 0;
      const inventoryMatch = String(totalInventory).includes(search); // Check total quantity as string

      // Check status string (derived value)
      const statusValue = table
        .getCoreRowModel()
        .rowsById[row.id]?.getValue('status'); // Get the calculated status value
      const statusMatch = String(statusValue ?? '')
        .toLowerCase()
        .includes(search);

      // Return true if any field matches
      return (
        nameMatch ||
        descriptionMatch ||
        skuMatch ||
        priceMatch ||
        weightMatch ||
        categoryNameMatch ||
        inventoryMatch ||
        statusMatch
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
    if (value === 'all') table.getColumn('status')?.setFilterValue(undefined);
    else table.getColumn('status')?.setFilterValue(value);
  };

  const handleCategoryFilter = (value: string) => {
    if (value === 'all') {
      table.getColumn('category')?.setFilterValue(undefined);
    } else {
      table.getColumn('category')?.setFilterValue(value);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const ok = await apiDeleteProduct(id);
    if (ok) {
      await fetchProducts(pagination.pageIndex, pagination.pageSize);
    }
    return ok;
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
    setIsDetailMode
  };
}
