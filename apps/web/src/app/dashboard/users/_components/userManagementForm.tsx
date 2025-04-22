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

import {
  
    Plus
  } from 'lucide-react';
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

  interface UserManagementFormProps {
    dialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
    formik: FormikProps<MyFormValues>;
    isEditMode: boolean;
  }
export default function UserManagementForm({
    dialogOpen,
    setDialogOpen,
    formik,
    isEditMode,

}:UserManagementFormProps){
    return (
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
                      <SelectItem value="1">Jakarta Store</SelectItem>
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
                <Button type="submit" >
                  { isEditMode
                      ? 'Simpan Perubahan'
                      : 'Tambah User'}
                </Button>
              </DialogFooter>
            </form>
            {/* End Formik Form */}
          </DialogContent>
        </Dialog>
    )
}