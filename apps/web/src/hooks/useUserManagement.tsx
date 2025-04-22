'use client';

import { useState } from 'react';
import {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useFormik } from 'formik';
import { userManagementAPI } from '@/lib/apis/dashboard/userManagement.api';
import { validationSchema } from '@/validations/user.validation';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
  } from '@/components/ui/dropdown-menu';
  import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
  import { MoreHorizontal } from 'lucide-react';
  import { Badge } from '@/components/ui/badge';
  import { toast } from '@/hooks/use-toast';

export function useUserManagement() {
  // Table state
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  
  // UI state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // API integration
  const {
    users,
    isLoading,
    fetchUsers,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
  } = userManagementAPI();
  
  // Form handling
  const formik = useFormik({
    initialValues: {
      gambar: '',
      nama: '',
      email: '',
      password: '',
      alamat: '',
      toko: '',
      kode_rujukan: '',
      role: '',
      verifikasi: false,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      let success = false;
      if (isEditMode && editingUserId) {
        success = await handleUpdateUser(editingUserId, values);
      } else {
        success = await handleCreateUser(values);
      }
      if (success) {
        resetForm();
        setDialogOpen(false);
      }
    },
  });
  const columns = [
    {
      accessorKey: 'gambar',
      header: 'Gambar',
      cell: ({ getValue }) => {
        const imageUrl = getValue<string>();
        return (
          <Avatar>
            {imageUrl ? (
              <AvatarImage src={imageUrl} alt="Avatar" />
            ) : (
              <AvatarFallback>NA</AvatarFallback>
            )}
          </Avatar>
        );
      },
    },
    { accessorKey: 'name', header: 'Nama' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'alamat', header: 'Alamat (Utama)' },
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'toko', header: 'Toko' },
    { accessorKey: 'referralCode', header: 'Kode Rujukan' },
    {
      accessorKey: 'verifikasi',
      header: 'Verifikasi',
      cell: ({ getValue }) => {
        const verified = getValue<boolean>();
        return (
          <Badge variant={verified ? 'default' : 'outline'}>
            {verified ? 'Terverifikasi' : 'Belum Terverifikasi'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'aksi',
      header: 'Aksi',
      cell: ({ row }: any) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm font-semibold text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 rounded-md shadow-lg bg-white">
              <DropdownMenuCheckboxItem
                onCheckedChange={() => {
                  setIsEditMode(true);
                  setEditingUserId(user.id);
                  setDialogOpen(true);
                  formik.setValues({
                    gambar: user.image || '',
                    nama: user.name || '',
                    email: user.email || '',
                    password: '', // don't pre-fill password for security
                    alamat: user.alamat || '',
                    toko: user.storeId || '',
                    kode_rujukan: user.referralCode || '',
                    role: user.role || '',
                    verifikasi: !!user.emailVerified,
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
                  handleDeleteUser(user.id);
                  toast({
                    variant: 'destructive',
                    description: 'User deleted Successfully !',
                  });
                }}
              >
                Delete
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  // Table creation function
  const table =  
    useReactTable({
      data: users,
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
          String(row.getValue('nama') ?? ''),
          String(row.getValue('email') ?? ''),
          String(row.getValue('role') ?? ''),
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
  
  
  // Helper functions
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(e.target.value);
  };

  const handleVerificationFilter = ( value: string) => {
    if (value === 'all') {
      table.getColumn('verifikasi')?.setFilterValue(undefined);
    } else if (value === 'true') {
      table.getColumn('verifikasi')?.setFilterValue(true);
    } else if (value === 'false') {
      table.getColumn('verifikasi')?.setFilterValue(false);
    }
  };

  return {
    // State
    users,
    isLoading,
    globalFilter,
    dialogOpen,
    isEditMode,
    editingUserId,
    
    // State setters
    setDialogOpen,
    setIsEditMode,
    setEditingUserId,
    
    // Functions
    fetchUsers,
    handleSearchChange,
    handleVerificationFilter,
    handleDeleteUser,
    handleCreateUser,
    handleUpdateUser,
    table,
    
    // Form
    formik,
  };
}