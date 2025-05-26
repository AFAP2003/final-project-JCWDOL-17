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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import storeManagementAPI from '@/lib/apis/dashboard/storeManagement.api';
import { userManagementAPI } from '@/lib/apis/dashboard/userManagement.api';
import { getValidationSchema } from '@/validations/user.validation';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useFormik } from 'formik';
import { MoreHorizontal } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export function useUserManagement() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [previews, setPreviews] = useState<string[]>([]);
  const [mainIndex, setMainIndex] = useState<number>(0);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState<
    'all' | 'SUPER' | 'ADMIN' | 'USER'
  >('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<
    'all' | 'true' | 'false'
  >('');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    users,
    isLoading,
    fetchUsers: apiFetchUsers,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser: apiDeleteUser,
  } = userManagementAPI();
  const { stores, fetchStores } = storeManagementAPI();

  const fetchUsers = useCallback(
    (
      pageIndex: number,
      pageSize: number,
      searchTerm: string,
      role: string,
      verified: string,
    ) => {
      return apiFetchUsers(
        pageIndex,
        pageSize,
        searchTerm,
        role,
        verified,
      ).then((json) => {
        if (json?.pagination) {
          setPageCount(json.pagination.totalPages);
        }
        return json;
      });
    },
    [apiFetchUsers],
  );

  useEffect(() => {
    fetchStores();
  }, []);

  // 1) debounce the raw searchTerm
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((p) => ({ ...p, pageIndex: 0 })); // reset **once** after typing stops
    }, 1000); // ← 300ms debounce

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers(
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearchTerm,
      selectedUserRole, // Use selectedUserRole directly since it now includes 'all'
      selectedVerification,
    );
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearchTerm,
    selectedUserRole,
    selectedVerification,
  ]);
  const formik = useFormik({
    initialValues: {
      image: null,
      nama: '',
      email: '',
      password: '',
      alamat: '',
      toko: '',
      kode_rujukan: '',
      role: 'ADMIN',
      verifikasi: false,
      telepon: '',
      gender: '',
      tglLahir: '',
    },
    validationSchema: getValidationSchema(isEditMode),
    onSubmit: async (values, { resetForm }) => {
      let success = false;
      if (isEditMode && editingUserId) {
        success = await handleUpdateUser(
          editingUserId,
          values,
          setIsProcessing,
        );
      } else {
        success = await handleCreateUser(values, setIsProcessing);
      }
      if (success) {
        resetForm();
        setDialogOpen(false);
        fetchUsers(
          pagination.pageIndex,
          pagination.pageSize,
          debouncedSearchTerm,
          selectedUserRole,
          selectedVerification,
        );
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
            {url ? (
              <AvatarImage src={url} alt="avatar" />
            ) : (
              <AvatarFallback>NA</AvatarFallback>
            )}
          </Avatar>
        );
      },
    },
    { accessorKey: 'name', header: 'Nama' },
    { accessorKey: 'email', header: 'Email' },
  
    { accessorKey: 'role', header: 'Role' },

    {
      header: 'Toko',

      cell: ({ row }) => {
        return row.original.store?.name ?? '-';
      },
    },
   
    {
      id: 'verifikasi',
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
                {user.role == 'ADMIN' && (
                  <>
                    <DropdownMenuCheckboxItem
                      onCheckedChange={() => {
                        setIsEditMode(true);
                        setEditingUserId(user.id);
                        setDialogOpen(true);
                        formik.setValues({
                          gambar: user.image || '',
                          nama: user.name || '',
                          email: user.email || '',
                          password: '',
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
                  </>
                )}
                {/* ✅ Always show Lihat Detail */}
                <DropdownMenuCheckboxItem
                  onCheckedChange={() => {
                    setIsEditMode(false);
                    setIsDetailMode(true);
                    formik.setValues({
                      image: null,
                      nama: user.name ?? '',
                      email: user.email ?? '',
                      password: '',
                      alamat: user.addresses?.[0]?.address ?? '',
                      toko: user.store?.id ?? '',
                      kode_rujukan: user.referralCode ?? '',
                      role: user.role ?? 'USER',
                      verifikasi: Boolean(user.emailVerified),
                      telepon: user.phone ?? '-',
                      gender: user.gender ?? '-',
                      tglLahir: user.dateOfBirth
                        ? new Date(user.dateOfBirth)
                            .toISOString()
                            .substring(0, 10)
                        : '',
                    });
                    setPreviews(user.image ? [user.image] : []);
                    setDialogOpen(true);
                  }}
                >
                  Lihat Detail
                </DropdownMenuCheckboxItem>
                {user.role == 'ADMIN' && (
                  <>
                    <DropdownMenuCheckboxItem
                      className="text-red-600"
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTimeout(() => setIsAlertOpen(true), 100);
                        }
                      }}
                    >
                      Delete
                    </DropdownMenuCheckboxItem>
                    {/* ❌ Hide Edit & Delete if row user is ADMIN */}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Confirmation Dialog for Delete */}
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus user?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah anda yakin untuk menghapus user "<b>{user.name}</b>"
                    dengan email "<b>{user.email}</b>" secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      handleDeleteUser(user.id, setIsProcessing);
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
  console.log('Current selectedUserRole:', selectedUserRole); // Add this line to debug

  const handleRoleFilter = (val: string) => {
    setSelectedUserRole(val as 'all' | 'SUPER' | 'ADMIN' | 'USER');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };
  const handleVerificationFilter = (val: string) => {
    setSelectedVerification(val as 'all' | 'true' | 'false');
    setPagination((p) => ({ ...p, pageIndex: 0 })); // Reset to first page when filtering
  };
  const handleDeleteUser = async (id: string, setIsProcessing) => {
    const ok = await apiDeleteUser(id, setIsProcessing);
    if (ok) {
      await fetchUsers(
        pagination.pageIndex,
        pagination.pageSize,
        debouncedSearchTerm,
        selectedUserRole,
        selectedVerification,
      );
    }
    return ok;
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedUserRole(''); // Set back to 'all'
    setSelectedVerification('');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

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
    previews,
    setPreviews,
    mainIndex,
    setMainIndex,
    isDetailMode,
    setIsDetailMode,
    selectedUserRole,
    searchTerm,
    clearAllFilters,
    selectedVerification,
    isProcessing,
    setIsProcessing,
  };
}
