import { categoryManagementAPI } from '@/lib/apis/dashboard/categoryManagement.api';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
import { getValidationSchema } from '@/validations/category.validation';
import { toast } from '@/hooks/use-toast';
export function useCategoryManagement() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null,);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const {
    categories,
    isLoading,
    fetchCategories: apiFetchCategories,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory:apiDeleteCategory,
  } = categoryManagementAPI();

  const fetchCategories = useCallback(
    (pageIndex: number, pageSize: number) => {
      return apiFetchCategories(pageIndex, pageSize).then((json) => {
        if (json?.pagination) {
          setPageCount(json.pagination.totalPages);
        }
        return json;
      });
    },
    [apiFetchCategories],
  );

  useEffect(() => {
    fetchCategories(pagination.pageIndex, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

  const formik = useFormik({
    initialValues: {
      nama: '',
      deskripsi: '',
      gambar: 'agraegae',
      isActive: true,
    },
    validationSchema: getValidationSchema(),
    onSubmit: async (values, { resetForm }) => {
      let success = false;
      if (isEditMode && editingCategoryId) {
        success = await handleUpdateCategory(editingCategoryId, values);
      } else {
        success = await handleCreateCategory(values);
      }
      if (success) {
        resetForm();
        setDialogOpen(false);
        fetchCategories(pagination.pageIndex, pagination.pageSize);

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

          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="text-sm font-semibold text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 rounded-md shadow-lg bg-white">
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
                <DropdownMenuCheckboxItem onCheckedChange={() => {}}>
                  Lihat Detail
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  className="text-red-600"
                  onCheckedChange={() => {
                    handleDeleteCategory(category.id);
                   
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
    data: categories,
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
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchText = String(filterValue).toLowerCase();
      const cellValues = [
        String(row.getValue('id') ?? ''),
        String(row.getValue('name') ?? ''),
        String(row.getValue('description') ?? ''),
      ];
      return cellValues.some((v) => v.toLowerCase().includes(searchText));
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(e.target.value);
  };

  const handleDeleteCategory = async (id: string) => {
    const ok = await apiDeleteCategory(id)
    if (ok) {
      await fetchCategories(pagination.pageIndex, pagination.pageSize)
    }
    return ok
  }
  

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
  };
}
