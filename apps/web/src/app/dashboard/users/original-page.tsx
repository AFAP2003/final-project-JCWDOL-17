'use client';

import { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Eye,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Import Hook Formik and Yup
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { User } from '@/lib/interfaces/userManagement.interface';
import { log } from 'console';
import { Description } from '@radix-ui/react-toast';

// Define table columns

export default function UserManagement() {
  // Table state setup
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [users, setUsers] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

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
        const user = row.original; // ✅ this gives full user object

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
                  handleDeleteUser(user.id)
                  toast({
                    variant: 'destructive',
                    description: 'User deleted Successfully !'
                  })
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

  useEffect(() => {
    fetchUsers();
  }, []);

  
  const fetchUsers = async () => {
    try {
      const userRes = await fetch('http://localhost:8000/api/dashboard/users');
      const userData = await userRes.json();

      if (userRes.ok) {
        setUsers(userData.data);
        console.log('Users fetched successfully: ', userData);
      } else {
        console.error(
          'Failed to fetch users:',
          userData.message || 'Unknown Error',
        );
      }
    } catch (error) {
      console.log('Error fetching data: ', error);
    }
  };

  // Function to create a new user
  const handleCreateUser = async (values) => {
    try {
      const userRes = await fetch('http://localhost:8000/api/dashboard/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: values.gambar,
          name: values.nama,
          email: values.email,
          password: values.password,
          role: values.role,
          storeId: values.toko,
          emailVerified: values.verifikasi,
        }),
      });

      const userData = await userRes.json();

      if (userRes.ok) {
        // If successful, refresh the user list
        fetchUsers();
        console.log('User Created Successfully: ', userData);
        toast({
          description: (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>User Created Successfully!</span>
            </div>
          ),
        });
        return true
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Create User.'
        })
        console.error(
          'Failed to create user:',
          userData.message || 'Unknown error',
        );
        return false
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error creating user.'
      })
      console.error('Error creating user:', error);
      return false
    } 
  };

  const handleUpdateUser = async (id: string, values) => {
    try {
      const userRes = await fetch(
        `http://localhost:8000/api/dashboard/users/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: values.gambar,
            name: values.nama,
            email: values.email,
            password: values.password,
            role: values.role,
            storeId: values.toko,
            emailVerified: values.verifikasi,
          }),
        },
      );

      const userData = await userRes.json();

      if (userRes.ok) {
        fetchUsers();
        toast({
          description: (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>User Updated Successfully!</span>
            </div>
          ),
        });
        console.log('User Updated Successfully: ', userData);
        return true
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Create User.'
        })
        console.error(
          'Failed to update user:',
          userData.message || 'Unknown error',
        );
        return false
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error updating user.'
      })
      console.error('Error updating user:', error);
      return false
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const userRes = await fetch(
        `http://localhost:8000/api/dashboard/users/${id}`,
        {
          method: 'DELETE',
        },
      );

      const userData = await userRes.json();

      if (userRes.ok) {
        fetchUsers(); // Refresh table
        toast({
          description: (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>User Deleted Successfully!</span>
            </div>
          ),
        });
        console.log('User deleted successfully:', userData);
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Delete User.'
        })
        console.error(
          'Failed to delete user:',
          userData.message || 'Unknown error',
        );
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error deleting user.'
      })
      console.error('Error deleting user:', error);
    }
  };

  // Define Yup validation schema for the form
  const validationSchema = Yup.object().shape({
    gambar: Yup.mixed(), // You may need to add custom validation for file type/size
    nama: Yup.string().required('Nama wajib diisi'),
    email: Yup.string()
      .email('Email tidak valid')
      .required('Email wajib diisi'),
    password: Yup.string().required('Password wajib diisi'),
    toko: Yup.string().required('Role wajib dipilih'), // Optional – you might require this based on your business rules
    role: Yup.string()
      .required('Role wajib dipilih')
      .oneOf(['USER', 'ADMIN', 'SUPER']),
    verifikasi: Yup.boolean(),
  });

  // Initialize Formik hook
  const formik = useFormik({
    initialValues: {
      gambar: '', // for file input, this will be a File (or empty string if no file selected)
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

  const table = useReactTable({
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

  // Handler for global search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(e.target.value);
  };

  // Handler for a status filter (if needed)
  const handleVerificationFilter = (value: string) => {
    if (value === 'all') {
      table.getColumn('verifikasi')?.setFilterValue(undefined);
    } else if (value === 'true') {
      table.getColumn('verifikasi')?.setFilterValue(true);
    } else if (value === 'false') {
      table.getColumn('verifikasi')?.setFilterValue(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col gap-6 p-4">
      {/* Header with title and "Tambah User" button with the modal form */}
      <div className="flex justify-between items-center">
        <h1 className="sm:text-4xl text-2xl font-bold">Manajemen User</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-[150px]">
              <Plus className="w-4 h-4 mr-1" />
              Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? 'Edit User' : 'Tambah User Baru'}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? 'Tolong isi detail di bawah ini untuk edit user.'
                  : 'Tolong isi detail di bawah ini untuk tambah user baru.'}
              </DialogDescription>
            </DialogHeader>
            {/* Begin Formik Hook Form */}
            <form onSubmit={formik.handleSubmit} className="grid gap-4 py-4">
              {/* Nama */}
              <div className="space-y-2">
                <label
                  htmlFor="nama"
                  className="text-sm font-medium text-gray-700"
                >
                  Nama
                </label>
                <Input
                  id="nama"
                  name="nama"
                  placeholder="Masukkan nama lengkap"
                  value={formik.values.nama}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.nama && formik.errors.nama && (
                  <p className="text-xs text-red-600">{formik.errors.nama}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-xs text-red-600">{formik.errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="text-xs text-red-600">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              {/* Alamat */}
              {/* <div className="space-y-2">
                <label
                  htmlFor="alamat"
                  className="text-sm font-medium text-gray-700"
                >
                  Alamat
                </label>
                <Input
                  id="alamat"
                  name="alamat"
                  placeholder="Masukkan alamat"
                  value={formik.values.alamat}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.alamat && formik.errors.alamat && (
                  <p className="text-xs text-red-600">{formik.errors.alamat}</p>
                )}
              </div> */}

              {/* Toko (dropdown) */}
              <div className="space-y-2">
                <label
                  htmlFor="toko"
                  className="text-sm font-medium text-gray-700"
                >
                  Toko
                </label>
                <Select
                  onValueChange={(value) => formik.setFieldValue('toko', value)}
                  value={formik.values.toko}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Toko" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Stores</SelectLabel>
                      <SelectItem value="1">
                        Jakarta Store
                      </SelectItem>
                    
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {formik.touched.toko && formik.errors.toko && (
                  <p className="text-xs text-red-600">{formik.errors.toko}</p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label
                  htmlFor="role"
                  className="text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <Select
                  onValueChange={(value) => formik.setFieldValue('role', value)}
                  value={formik.values.role}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Role</SelectLabel>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPER">Super Admin</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {formik.touched.role && formik.errors.role && (
                  <p className="text-xs text-red-600">{formik.errors.role}</p>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  className="mt-2 sm:mt-0"
                  onClick={() => {
                    formik.resetForm();
                    setDialogOpen(false);
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Mengirim...'
                    : isEditMode
                      ? 'Simpan Perubahan'
                      : 'Tambah User'}
                </Button>
              </DialogFooter>
            </form>
            {/* End Formik Form */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter row */}
      <div className="mb-4 flex items-end justify-between gap-2 sm:gap-0">
        <div className="flex gap-2">
          <Input
            placeholder="Cari..."
            value={globalFilter}
            onChange={handleSearchChange}
            className="order-2 h-9 w-[140px] text-sm sm:w-[200px] sm:order-1"
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
          <Select onValueChange={handleVerificationFilter} defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Pilih Verifikasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Pilih Role</SelectLabel>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="true">User</SelectItem>
                <SelectItem value="false">Store Admin</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select onValueChange={handleVerificationFilter} defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Pilih Verifikasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Pilih Verifikasi</SelectLabel>
                <SelectItem value="all">Semua Verifikasi</SelectItem>
                <SelectItem value="true">Terverifikasi</SelectItem>
                <SelectItem value="false">Belum Terverifikasi</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <DropdownMenu modal={true}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Eye /> Lihat
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Kolom</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {typeof column.columnDef.header === 'string'
                      ? column.columnDef.header
                      : flexRender(
                          column.columnDef.header,
                          column.getContext(),
                        )}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main table */}
      <div className="rounded-md border border-gray-200 overflow-x-auto w-full">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    className="cursor-pointer select-none whitespace-nowrap"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {{ asc: ' 🔼', desc: ' 🔽' }[
                      header.column.getIsSorted() as string
                    ] ?? null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div>
          Halaman {table.getState().pagination.pageIndex + 1} dari{' '}
          {table.getPageCount()}
        </div>
      </div>
    </div>
  );
}
