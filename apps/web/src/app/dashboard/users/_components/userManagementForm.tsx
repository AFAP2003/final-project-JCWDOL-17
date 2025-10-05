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
import { Eye, EyeOff, Plus, RefreshCw } from 'lucide-react';
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
import { useEffect, useState } from 'react';
import { Store } from '@/lib/interfaces/storeManagement.interface';

interface UserManagementFormProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  formik: FormikProps<MyFormValues>;
  isEditMode: boolean;
  stores: Store[];
  setIsEditMode: (edit: boolean) => void;
  setEditingUserId: (id: string | null) => void;
  previews: string[];
  setPreviews: (any: any) => any[];
  setMainIndex: (index: number) => void;
  isDetailMode: boolean;
  setIsDetailMode: (detail: boolean) => void;
}

export default function UserManagementForm({
  dialogOpen,
  setDialogOpen,
  formik,
  isEditMode,
  stores,
  setIsEditMode,
  setEditingUserId,
  previews,
  setPreviews,
  setMainIndex,
  isDetailMode,
  setIsDetailMode,
}: UserManagementFormProps) {
  const [showAdminFields, setShowAdminFields] = useState(true);
  const [showInfoFields, setShowInfoFields] = useState(true);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    formik.setFieldValue('image', [file]);

    const previewUrl = URL.createObjectURL(file);
    setPreviews([previewUrl]);
    setMainIndex(0);
  };

  useEffect(() => {
    // When user selects a role that's not ADMIN or SUPER, hide the admin fields
    if (formik.values.role && formik.values.role !== 'ADMIN') {
      setShowAdminFields(false);
    } else {
      setShowAdminFields(true);
    }
  }, [formik.values.role]);

  useEffect(() => {
    if (
      (formik.values.role && formik.values.role == 'SUPER') ||
      formik.values.role == 'ADMIN'
    ) {
      setShowInfoFields(false);
    } else {
      setShowInfoFields(true);
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const handleGeneratePassword = () => {
    const pwd = genRandomString().slice(0, 12);
    formik.setFieldValue('password', pwd, true);
    try {
      navigator.clipboard.writeText(pwd);
    } catch (_) {}
  };
  const disabled = isDetailMode;
  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);

        if (open && !isEditMode) {
          formik.resetForm();
          setPreviews([]);
          setMainIndex(0);
          setIsDetailMode(false);
        }

        if (!open) {
          setIsEditMode(false);
          setIsDetailMode(false);
          setEditingUserId(null);
          setPreviews([]);
          setMainIndex(0);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-[150px]">
          <Plus className="w-4 h-4 mr-1" />
          Tambah User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[95%] sm:w-full sm:max-h-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isDetailMode
              ? 'Lihat Detail User'
              : isEditMode
                ? 'Edit User'
                : 'Tambah User Baru'}
          </DialogTitle>
          <DialogDescription className={`${disabled ? 'hidden' : 'block'}`}>
            {isEditMode
              ? 'Tolong isi detail di bawah ini untuk edit user.'
              : 'Tolong isi detail di bawah ini untuk tambah user baru.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="grid gap-4 py-4">
          {/* foto */}
          <div className="space-y-2">
            <label className="mb-1 block text-sm font-medium">Foto</label>
            <Input
              id="image"
              name="image"
              type="file"
              accept=".jpg,.jpeg,.png,.gif"
              onChange={handleFileChange}
              disabled={disabled}
            />
            {formik.touched.foto && formik.errors.foto && (
              <p className="text-xs text-red-600">{formik.errors.foto}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Format yang didukung: JPG, JPEG, PNG, GIF. Ukuran maks.: 1MB.
            </p>

            <div className="flex gap-4 mt-4 flex-wrap">
              {previews.map((src, index) => (
                <div
                  key={index}
                  className="relative w-[100px] h-[100px] border rounded overflow-hidden"
                >
                  <img
                    src={src}
                    alt={`preview-${index}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* toko */}
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
              disabled={disabled}
            />
            {formik.touched.nama && formik.errors.nama && (
              <p className="text-xs text-red-600">{formik.errors.nama}</p>
            )}
          </div>

          {isDetailMode && showInfoFields && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Jenis Kelamin</label>
                <Input value={formik.values.gender} readOnly disabled />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Telepon</label>
                <Input value={formik.values.telepon} readOnly disabled />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal Lahir</label>
                <Input
                  value={
                    formik.values.tglLahir
                      ? new Date(formik.values.tglLahir).toLocaleDateString(
                          'id-ID',
                        )
                      : '-'
                  }
                  readOnly
                  disabled
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Alamat</label>
                <Input value={formik.values.alamat} readOnly disabled />
              </div>
            </>
          )}

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
              disabled={disabled}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-red-600">{formik.errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label
                htmlFor="password"
                className={`${isDetailMode ? 'hidden' : 'block'} text-sm font-medium text-gray-700`}
              >
                Password
              </label>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className={`${isDetailMode ? 'hidden' : 'block'}  h-7 px-2 flex`}
                onClick={handleGeneratePassword}
                title="Generate & copy password"
                disabled={disabled}
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
                disabled={disabled}
                className={isDetailMode ? 'hidden' : 'block'}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                onClick={() => setShowPassword(!showPassword)}
                className={`${isDetailMode ? 'hidden' : 'block'} absolute bottom-1 right-1 h-7 w-7`}
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

          {showAdminFields && (
            <>
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
                  disabled={disabled}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Toko" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Stores</SelectLabel>
                      {stores.map((store) => (
                        <SelectItem value={store.id} key={store.id}>
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
                <label
                  htmlFor="role"
                  className="text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <Select
                  onValueChange={(value) => formik.setFieldValue('role', value)}
                  value={formik.values.role}
                  disabled={disabled}
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
            </>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              className={`${disabled ? 'hidden' : 'block'} mt-2 sm:mt-0`}
              onClick={() => {
                formik.resetForm();
                setDialogOpen(false);
              }}
              type="button"
            >
              Cancel
            </Button>
            <Button
              className={`${disabled ? 'hidden' : 'block'}`}
              type="submit"
              disabled={formik.isSubmitting}
            >
              {isEditMode ? 'Simpan Perubahan' : 'Tambah User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
