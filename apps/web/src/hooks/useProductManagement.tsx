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
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { categoryManagementAPI } from '@/lib/apis/dashboard/categoryManagement.api';
import { getValidationSchema } from '@/validations/product.validation';
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
  const {
    products,
    isLoading,
    fetchProducts: apiFetchProducts,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct:apiDeleteProduct,
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

  useEffect(()=>{
    fetchCategories(0,50)
  },[])
  const formik = useFormik({
    initialValues: {
      nama: '',
      deskripsi: '',
      harga: '0',
      berat: '1',
      sku: Math.random().toString(36).substring(2),
      kategoriId: '',
      isActive: true,
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
        accessorKey: 'gambar',
        header: 'Gambar',
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
      { accessorKey: 'name', header: 'Produk' },
      {
        accessorKey: 'category',
        header: 'Kategori',
        accessorFn: (row) => row.category?.name ?? 'N/A',
        cell: ({ row }) => {
          return row.original.category?.name ?? 'N/A';
        },
      },
      { accessorKey: 'price', header: 'Harga' },
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
          return 'Tersedia';
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

          return (
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
                    });
                  }}
                >
                  Edit
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="text-red-600"
                  onCheckedChange={() => {
                    handleDeleteProduct(product.id);

                  }}
                >
                  Delete
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
    const ok = await apiDeleteProduct(id)
    if (ok) {
      await fetchProducts(pagination.pageIndex, pagination.pageSize)
    }
    return ok
  }
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
    setEditingProductId
  };
}
