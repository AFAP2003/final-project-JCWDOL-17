import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FormikProps } from 'formik';
import {  Eye, EyeOff, Plus, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MyFormValues } from '@/validations/user.validation';
import { genRandomString } from '@/lib/utils';
import { useState } from 'react';
import { Store } from '@/lib/interfaces/storeManagement.interface';

interface UserManagementFormProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  formik: FormikProps<MyFormValues>;
  isEditMode: boolean;
  stores: Store[];
  setIsEditMode: (edit: boolean) => void;
  setEditingUserId: (id: string | null) => void;
}

export default function UserManagementForm({
  dialogOpen,
  setDialogOpen,
  formik,
  isEditMode,
  stores,
  setIsEditMode,
  setEditingUserId,
}: UserManagementFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const handleGeneratePassword = () => {
    const pwd = genRandomString().slice(0, 12);
    formik.setFieldValue('password', pwd, true);
    try {
      navigator.clipboard.writeText(pwd);
    } catch (_) {
    }
  };
  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);

        if (open && !isEditMode) {
          formik.resetForm();
        }

        if (!open) {
          setIsEditMode(false);
          setEditingUserId(null);
        }
      }}
    >
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
        <form onSubmit={formik.handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="nama" className="text-sm font-medium text-gray-700">
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
              placeholder="nama@admin.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-red-600">{formik.errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <Button
                type="button"
                size="sm" 
                variant="secondary" 
                className="  h-7 px-2 "
                onClick={handleGeneratePassword}
                title="Generate & copy password"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Buat Password
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute bottom-1 right-1 h-7 w-7"
                title={showPassword ? 'Sembunyikan' : 'Lihat password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">toggle password</span>
              </Button>
            </div>

            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-red-600">{formik.errors.password}</p>
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

          <div className="space-y-2">
            <label htmlFor="toko" className="text-sm font-medium text-gray-700">
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
                  {stores.map((store) => (
                    <SelectItem value={store.name} key={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {formik.touched.toko && formik.errors.toko && (
              <p className="text-xs text-red-600">{formik.errors.toko}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium text-gray-700">
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
                  <SelectItem value="ADMIN">Store Admin</SelectItem>
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
            <Button type="submit">
              {isEditMode ? 'Simpan Perubahan' : 'Tambah User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
