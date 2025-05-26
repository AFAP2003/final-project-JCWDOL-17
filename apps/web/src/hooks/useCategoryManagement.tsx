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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { categoryManagementAPI } from '@/lib/apis/dashboard/categoryManagement.api';
import { useSession } from '@/lib/auth/client';
import { getValidationSchema } from '@/validations/category.validation';
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
export function useCategoryManagement() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const { data: session, isPending: isSessionLoading } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const user = session?.user;

  const {
    categories,
    isLoading,
    fetchCategories: apiFetchCategories,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory: apiDeleteCategory,
  } = categoryManagementAPI();

  const fetchCategories = useCallback(
    (pageIndex: number, pageSize: number, search: string) => {
      return apiFetchCategories(pageIndex, pageSize, search).then((json) => {
        if (json?.pagination) {
          setPageCount(json.pagination.totalPages);
        }
        return json;
      });
    },
    [apiFetchCategories],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((p) => ({ ...p, pageIndex: 0 })); // reset **once** after typing stops
    }, 1000); // ← 300ms debounce

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchCategories(
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearchTerm,
    );
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearchTerm]);

  const formik = useFormik({
    initialValues: {
      nama: '',
      deskripsi: '',
      gambar: 'random',
      isActive: true,
    },
    validationSchema: getValidationSchema(),
    onSubmit: async (values, { resetForm }) => {
      let success = false;
      if (isEditMode && editingCategoryId) {
        success = await handleUpdateCategory(
          editingCategoryId,
          values,
          setIsProcessing,
        );
      } else {
        success = await handleCreateCategory(values, setIsProcessing);
      }
      if (success) {
        resetForm();
        setDialogOpen(false);
        fetchCategories(
          pagination.pageIndex,
          pagination.pageSize,
          debouncedSearchTerm,
        );
      }
    },
  });

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: 'name', header: 'Nama' },
      { accessorKey: 'description', header: 'Deskripsi' },
      {
        accessorKey: 'aksi',
        header: 'Aksi',
        cell: ({ row }: any) => {
          const category = row.original;
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
                        setIsEditMode(true);
                        setEditingCategoryId(category.id);
                        setDialogOpen(true);
                        formik.setValues({
                          gambar: category.image || '',
                          nama: category.name || '',
                          isActive: category.isActive || '',
                          deskripsi: category.description || '',
                        });
                      }}
                    >
                      Edit
                    </DropdownMenuCheckboxItem>
                  )}

                  <DropdownMenuCheckboxItem
                    onSelect={(e) => {
                      setIsEditMode(false);
                      setIsDetailMode(true);
                      formik.setValues({
                        gambar: category.image || '',
                        nama: category.name || '',
                        isActive: category.isActive || '',
                        deskripsi: category.description || '',
                      });

                      setDialogOpen(true);
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
                    <AlertDialogTitle>Hapus kategori?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah anda yakin untuk menghapus kategori dengan nama "
                      <b>{category.name}</b>" secara permanen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        handleDeleteCategory(category.id, setIsProcessing);
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
    [
      user,
      formik,
      setIsEditMode,
      setEditingCategoryId,
      setIsDetailMode,
      setDialogOpen,
    ],
  );

  const table = useReactTable({
    data: categories,
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteCategory = async (id: string, setIsProcessing) => {
    const ok = await apiDeleteCategory(id, setIsProcessing);
    if (ok) {
      await fetchCategories(
        pagination.pageIndex,
        pagination.pageSize,
        debouncedSearchTerm,
      );
    }
    return ok;
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  return {
    isLoading,
    formik,
    columns,
    table,
    globalFilter,
    sorting,
    pagination,
    columnFilters,
    columnVisibility,
    handleSearchChange,
    fetchCategories,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    dialogOpen,
    isEditMode,
    setDialogOpen,
    isDetailMode,
    setIsDetailMode,
    isSessionLoading,
    user,
    setIsEditMode,
    setEditingCategoryId,
    clearAllFilters,
    searchTerm,
    isProcessing,
  };
}
