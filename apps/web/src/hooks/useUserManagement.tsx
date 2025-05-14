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
<<<<<<< HEAD
  const [pageCount,setPageCount] = useState(1)
  const [previews, setPreviews] = useState<string[]>([]); 
  const [mainIndex, setMainIndex] = useState<number>(0);  
  const [isDetailMode, setIsDetailMode] = useState(false);
=======
  const [pageCount, setPageCount] = useState(1);
>>>>>>> 5fbb53ad0ab02c3b0f9a34d0a373ffaf2da7ebc7

  const {
    users,
    isLoading,
    fetchUsers: apiFetchUsers,
    handleCreateUser,
    handleUpdateUser,
<<<<<<< HEAD
    handleDeleteUser:apiDeleteUser,
=======
    handleDeleteUser: apiDeleteUser,
>>>>>>> 5fbb53ad0ab02c3b0f9a34d0a373ffaf2da7ebc7
  } = userManagementAPI();
  const { stores, fetchStores } = storeManagementAPI();

  const fetchUsers = useCallback(
    (pageIndex: number, pageSize: number) => {
      return apiFetchUsers(pageIndex, pageSize).then((json) => {
        if (json?.pagination) {
          setPageCount(json.pagination.totalPages);
        }
        return json;
      });
    },
    [apiFetchUsers],
  );

  useEffect(() => {
    fetchUsers(pagination.pageIndex, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchStores();
  }, []);
  const formik = useFormik({
    initialValues: {
      image: null as FileList | null,
      nama: '',
      email: '',
      password: '',
      alamat: '',
      toko: '',
      kode_rujukan: '',
      role: 'ADMIN',
      verifikasi: false,
    },
    validationSchema: getValidationSchema(isEditMode),
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
<<<<<<< HEAD

=======
>>>>>>> 5fbb53ad0ab02c3b0f9a34d0a373ffaf2da7ebc7
      }
    },
  });
  const columns = [
    {
      accessorKey: 'image',
      header: 'Gambar',
      cell: ({ getValue }) => {
        const url = getValue<string>();
        return (
          <Avatar>
            {url ? <AvatarImage src={url} alt="avatar" /> : <AvatarFallback>NA</AvatarFallback>}
          </Avatar>
        );
      },
    },
    { accessorKey: 'name', header: 'Nama' },
    { accessorKey: 'email', header: 'Email' },
<<<<<<< HEAD
    // {  header: 'Alamat (Utama)' ,

    //   accessorFn: (row: any) => {
    //     return row.addresses?.length > 0 ? row.addresses[0].address : '-';
    //   }
    // },
=======
    {
      header: 'Alamat (Utama)',

      accessorFn: (row: any) => {
        return row.addresses?.length > 0 ? row.addresses[0].address : 'NA';
      },
    },
>>>>>>> 5fbb53ad0ab02c3b0f9a34d0a373ffaf2da7ebc7
    { accessorKey: 'role', header: 'Role' },
    // {
    //   accessorKey: 'gender',
    //   header: 'Jenis Kelamin',
    //   cell: ({ getValue }) => {
    //     const gender = getValue();
    //     return gender === 'MALE' ? 'Laki-laki' : gender === 'FEMALE' ? 'Perempuan' : '-';
    //   },
    // },
    // {
    //   accessorKey: 'phone',
    //   header: 'Telepon',
    //   cell: ({ getValue }) => {
    //     const phone = getValue()
    //     return phone ?`+${getValue()}` : '-'
    //   }
    // },
    // {
    //   accessorKey: 'dateOfBirth',
    //   header: 'Tanggal Lahir',
    //   cell: ({ getValue }) =>
    //   {
    //     const value = getValue()
    //     if (!value){
    //       return '-'
    //     }
        
    //     return  new Date(getValue<string>()).toLocaleDateString('id-ID')

    //   }
    // },
    {
      header: 'Toko',
<<<<<<< HEAD
     
      cell: ({ row }) => {
        return row.original.managedStore?.name ?? '-';

      },
    },
    // { accessorKey: 'referralCode',
    //    header: 'Kode Rujukan',
    //   cell:({getValue})=>{
    //     return getValue() || '-'}
    //   },
    {id: 'verifikasi',
=======
      accessorFn: (row: any) => row.store?.name ?? 'NA',
    },
    { accessorKey: 'referralCode', header: 'Kode Rujukan' },
    {
      id: 'verifikasi',
>>>>>>> 5fbb53ad0ab02c3b0f9a34d0a373ffaf2da7ebc7
      header: 'Verifikasi',
      accessorFn: (row: any) => row.emailVerified,
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
                  setPreviews(user.image ? [user.image] : []);
                }}
              >
                Edit
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem onCheckedChange={() => {
                setIsEditMode(false)
                setIsDetailMode(true)
              formik.setValues({
  // keep the file input empty — previews handle the old image
  image: null,

  // basic fields
  nama:         user.name           ?? '',
  email:        user.email          ?? '',
  password:     '',                    // never pre-fill passwords

  // address (takes the first one as “utama”)
  alamat:       user.addresses?.[0]?.address ?? '',

  // store
  toko:         user.managedStore?.id     ?? '',

  // referral
  kode_rujukan: user.referralCode         ?? '',
  role:         user.role                 ?? 'USER',
  verifikasi:   Boolean(user.emailVerified),

  // the “extra” detail-only fields
  telepon:        user.phone           ?? '-',
  gender:       user.gender          ?? '-',
  // for a <Input type="date" />, format as YYYY-MM-DD
  tglLahir:  user.dateOfBirth
    ? new Date(user.dateOfBirth).toISOString().substring(0, 10)
    : '',
});
                setPreviews(user.image ? [user.image] : []);

                setDialogOpen(true)
              }}>
                Lihat Detail
              </DropdownMenuCheckboxItem>
<<<<<<< HEAD
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
=======
              <DropdownMenuCheckboxItem
                className="text-red-600"
                onCheckedChange={() => {
                  handleDeleteUser(user.id);
                }}
              >
                Delete
              </DropdownMenuCheckboxItem>
>>>>>>> 5fbb53ad0ab02c3b0f9a34d0a373ffaf2da7ebc7
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus user?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah anda yakin untuk menghapus user "<b>{user.name}</b>" dengan email "<b>{user.email}</b>" secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={ () => {
                handleDeleteUser(user.id);

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
  ];
  // Table creation function
  const table = useReactTable({
    data: users,
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

  const handleVerificationFilter = (value: string) => {
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
    else table.getColumn('role')?.setFilterValue(val); // ⬅︎ new
  };

  const handleDeleteUser = async (id: string) => {
    const ok = await apiDeleteUser(id);
    if (ok) {
      await fetchUsers(pagination.pageIndex, pagination.pageSize);
    }
<<<<<<< HEAD
    return ok
  }
  
=======
    return ok;
  };

>>>>>>> 5fbb53ad0ab02c3b0f9a34d0a373ffaf2da7ebc7
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
    columns,
<<<<<<< HEAD
    previews,
    setPreviews,
    mainIndex,
    setMainIndex,
    isDetailMode,
    setIsDetailMode
=======
>>>>>>> 5fbb53ad0ab02c3b0f9a34d0a373ffaf2da7ebc7
  };
}
