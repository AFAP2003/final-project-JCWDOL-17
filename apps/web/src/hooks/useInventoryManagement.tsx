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
import { useSession } from '@/lib/auth/client';
import { getValidationSchema } from '@/validations/inventory.validation';
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

export default function UseInventoryManagement() {
  const {
    inventories,
    isLoading,
    fetchInventories: apiFetchInventories,
    handleCreateInventory,
    handleUpdateInventory,
    handleDeleteInventory: apiDeleteInventory,
  } = inventoryManagementAPI();

  const { stores, fetchStores, fetchStoreByAdminId, storeByAdmin } =
    storeManagementAPI();
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
  const [isDetailDropdown, setIsDetailDropdown] = useState(false);
  const [searchTerm,setSearchTerm] = useState('')
  const [debouncedSearchTerm,setDebouncedSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Stok Tersedia' | 'Stok Rendah' | 'Stok Habis'>('');
  const [selectedStore, setSelectedStore] = useState<'all' | string>('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('');
  
  const { data: session, isPending: isSessionLoading } = useSession();
  const [isProcessing,setIsProcessing] = useState(false)
  const user = session?.user;
  const columns = useMemo<ColumnDef<any>[]>(() => {
    const cols: ColumnDef<any>[] = [
      {
        accessorKey: 'gambar',
        header: 'Gambar',
        cell: ({ row }) => {
          const mainImg = row.original.product.images.find((img) => img.isMain);
          const url = mainImg?.imageUrl;
          return url ? (
            <Avatar className="h-32 w-32 rounded-md overflow-hidden">
              <AvatarImage src={url} alt="main product image" />
            </Avatar>
          ) : (
            <Avatar className="h-32 w-32 rounded-sm flex items-center justify-center">
              <ImageOff className="w-8 h-8 text-gray-400" />
            </Avatar>
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
    ];

    // only super-admins get the “Toko” column
    if (user?.role === 'SUPER') {
      cols.push({
        id: 'store',
        header: 'Toko',
        accessorFn: (row) => row.store?.name ?? '',
        cell: ({ row }) => row.original.store?.name ?? '-',
      });
    }

    // now append the rest of your columns
    cols.push(
      {
        header: 'Harga',
        cell: ({ row }) => {
          const price = Number(row.original.product.price);
          return `Rp ${price.toLocaleString()}`;
        },
      },
      {
        header: 'Stok',
        cell: ({ row }) => row.original.quantity?.toString() ?? '0',
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
          const qty = row.original.quantity;
          const min = row.original.minStock;
          const status =
            qty === 0
              ? 'Stok Habis'
              : qty <= min
                ? 'Stok Rendah'
                : 'Stok Tersedia';
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
        cell: ({ row }) =>
          new Date(row.original.updatedAt).toLocaleString('id-ID'),
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
                      setIsDetailDropdown(true);
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
                      setDialogOpen(true);

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
                        handleDeleteInventory(inventory.id,setIsProcessing);
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
    );

    return cols;
  }, [user?.role]);

  const fetchInventories = useCallback(
    (pageIndex: number, pageSize: number,searchTerm:string,store:string,category:string,status:string) => {
      return apiFetchInventories(pageIndex, pageSize,searchTerm,store,category,status).then((json) => {
        if (json?.pagination) {
          setPageCount(json.pagination.totalPages);
        }
        return json;
      });
    },
    [apiFetchInventories],
  );

  useEffect(() => {
    fetchInventories(pagination.pageIndex, pagination.pageSize,debouncedSearchTerm,selectedStore,selectedCategory,selectedStatus);
  }, [pagination.pageIndex, pagination.pageSize,debouncedSearchTerm,selectedStore,selectedCategory,selectedStatus]);

   useEffect(() => {
          const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
                setPagination(p => ({ ...p, pageIndex: 0 })); // reset **once** after typing stops
  
          }, 1000);                // ← 300ms debounce
  
            return () => clearTimeout(handler);
          }, [searchTerm]);
          
  useEffect(() => {
    fetchStores();
    fetchCategories(0, 50);
    fetchProducts(0, 50);
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchStoreByAdminId(user.id);
    }
  }, [user]);

  const formik = useFormik({
    initialValues: {
      produk: '',
      toko: user?.role == 'ADMIN' ? user.storeId! : '',
      mode: 'tambah' as 'tambah' | 'kurangi',
      tambah: '',
      kurangi: '',
      minimal: '',
      sekarang: 0,
      baru: 0,
    },

    validationSchema: getValidationSchema(),

    onSubmit: async (values, { resetForm }) => {

      const selectedStoreId =
        user?.role === 'ADMIN'
          ? storeByAdmin?.id
          : values.toko || values.storeId || '';

      const existingInv = inventories.find(
        (inv) =>
          String(inv.productId) === String(values.produk) &&
          String(inv.storeId) === String(selectedStoreId),
      );

      let success = false;
      let inventoryIdToProcess = null; // Variable to hold the ID for update

      // --- CRITICAL LOGIC CHANGE HERE ---
      // If we're explicitly in 'edit mode' (from clicking an edit button on the table)
      // AND we have a valid editingInventoryId from the context, use that.
      if (isEditMode && editingInventoryId) {
      
        inventoryIdToProcess = editingInventoryId;
      }
      // ELSE IF an existing inventory was found based on form selections (from '+' button)
      // This is the path for '+' button when an existing item is selected
      else if (existingInv) {
        
        inventoryIdToProcess = existingInv.id;
      }
      // ELSE it's a completely new item to be created
      else {
        const newQuantity =
          values.mode === 'tambah'
            ? Number(values.tambah || 0)
            : Math.max(
                0,
                Number(values.sekarang) - Number(values.kurangi || 0),
              );
        console.log(
          '>>> 3c1. Calling handleCreateInventory with quantity:',
          newQuantity,
          ' and storeId:',
          selectedStoreId,
        );
        success = await handleCreateInventory({
          productId: values.produk,
          storeId: selectedStoreId,
          quantity: newQuantity,
          minStock: Number(values.minimal),
          
        },setIsProcessing);
      }
      // --- END CRITICAL LOGIC CHANGE ---

      // --- Execute Update if an ID was determined for it ---
      if (inventoryIdToProcess) {
        // Only call update if an ID was set in the branches above
        
        success = await handleUpdateInventory(inventoryIdToProcess, values,setIsProcessing);
      }


      if (success) {
       
        resetForm();
        setDialogOpen(false);
        await fetchInventories(pagination.pageIndex, pagination.pageSize,debouncedSearchTerm,selectedStore,selectedCategory,selectedStatus);
      } else {
        console.log('>>> 6. Operation FAILED (success is false).');
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
   setSelectedStatus(value);
  setPagination(p => ({ ...p, pageIndex: 0 }));
  };

  const handleStoreFilter = (value: string) => {
  setSelectedStore(value);
  setPagination(p => ({ ...p, pageIndex: 0 }));
  };

  const handleCategoryFilter = (value: string) => {
  setSelectedCategory(value);
  setPagination(p => ({ ...p, pageIndex: 0 }));
  };

  const handleDeleteInventory = async (id: string,setIsProcessing) => {
    const ok = await apiDeleteInventory(id,setIsProcessing);
    if (ok) {
      await fetchInventories(pagination.pageIndex, pagination.pageSize,debouncedSearchTerm,selectedStore,selectedCategory,selectedStatus);
    }
    return ok;
  };


  const clearAllFilters = () => {
  setSearchTerm('');
  setSelectedCategory('')
  setSelectedStatus('')
  setSelectedStore('')
  setPagination(p => ({ ...p, pageIndex: 0 }));
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
    isSessionLoading,
    user,
    isDetailDropdown,
    setIsDetailDropdown,
    fetchStoreByAdminId,
    storeByAdmin,
    clearAllFilters,
    searchTerm,
    selectedStatus,
    selectedCategory,
    selectedStore,
    setSelectedStatus,
    setSelectedStore,
    setSelectedCategory,
    isProcessing
  };
}
