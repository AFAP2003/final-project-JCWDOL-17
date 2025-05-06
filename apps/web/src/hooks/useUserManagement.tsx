import { useCallback, useEffect, useState } from 'react';
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
import { getValidationSchema } from '@/validations/user.validation';
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
import storeManagementAPI from '@/lib/apis/dashboard/storeManagement.api';

export function useUserManagement() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [pageCount,setPageCount] = useState(1)

  const {
    users,
    isLoading,
    fetchUsers:apiFetchUsers,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser:apiDeleteUser,
  } = userManagementAPI();
  const{stores,fetchStores}=storeManagementAPI()


   const fetchUsers = useCallback((pageIndex:number, pageSize:number) => {
      return apiFetchUsers(pageIndex, pageSize).then(json => {
        if (json?.pagination) {
          setPageCount(json.pagination.totalPages);
        }
        return json;
      });
    }, [apiFetchUsers]);
  
    useEffect(() => {
      fetchUsers(pagination.pageIndex , pagination.pageSize);
    }, [pagination.pageIndex, pagination.pageSize]);

    useEffect(()=>{
      fetchStores()
    },[])
  const formik = useFormik({
    initialValues: {
      gambar: '',
      nama: '',
      email: '',
      password: '',
      alamat: '',
      toko: '',
      kode_rujukan: '',
      role: 'ADMIN',
      verifikasi: false,
    },
    validationSchema:getValidationSchema(isEditMode), 
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
        fetchUsers(pagination.pageIndex, pagination.pageSize);

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
    {  header: 'Alamat (Utama)' ,

      accessorFn: (row: any) => {
        return row.addresses?.length > 0 ? row.addresses[0].address : 'NA';
      }
    },
    { accessorKey: 'role', header: 'Role' },
    {
      header: 'Toko',
      accessorFn: (row: any) =>
        row.store?.name ?? 'NA',    },
    { accessorKey: 'referralCode', header: 'Kode Rujukan' },
    {id: 'verifikasi',
      header: 'Verifikasi',
      accessorFn: (row:any) => row.emailVerified,
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
      manualPagination:true,
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
          String(row.getValue('nama') ?? ''),
          String(row.getValue('email') ?? ''),
          String(row.getValue('role') ?? ''),
          String(row.getValue('referralCode') ?? ''),
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

  const handleVerificationFilter = ( value: string) => {
    if (value === 'all') {
      table.getColumn('verifikasi')?.setFilterValue(undefined);
    } else if (value === 'true') {
      table.getColumn('verifikasi')?.setFilterValue(true);
    } else if (value === 'false') {
      table.getColumn('verifikasi')?.setFilterValue(false);
    }
  };

  const handleRoleFilter = (val: string) => {
    if (val === 'all') table.getColumn('role')?.setFilterValue(undefined);
    else table.getColumn('role')?.setFilterValue(val);  // ⬅︎ new
  };

  const handleDeleteUser = async (id: string) => {
    const ok = await apiDeleteUser(id)
    if (ok) {
      await fetchUsers(pagination.pageIndex, pagination.pageSize)
    }
    return ok
  }
  
  return {
    users,
    isLoading,
    globalFilter,
    dialogOpen,
    isEditMode,
    editingUserId,
    setDialogOpen,
    setIsEditMode,
    setEditingUserId,
    fetchUsers,
    handleSearchChange,
    handleVerificationFilter,
    handleDeleteUser,
    handleCreateUser,
    handleUpdateUser,
    table,
    stores,
    fetchStores,
    handleRoleFilter,
    formik,
    columns
  };
}