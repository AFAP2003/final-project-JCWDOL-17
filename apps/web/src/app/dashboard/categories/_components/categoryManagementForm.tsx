import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MyFormValues } from '@/validations/user.validation';
import { FormikProps } from 'formik';
import { Plus } from 'lucide-react';

interface CategoryManagementFormProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  formik: FormikProps<MyFormValues>;
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
  setEditingUserId: (id: string | null) => void;
}
export default function CategoryManagementForm({
  formik,
  dialogOpen,
  setDialogOpen,
  isEditMode,
  setIsEditMode,
  setEditingUserId,
}: CategoryManagementFormProps) {
  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        // update the open state
        setDialogOpen(open);

        if (open && !isEditMode) {
          // fresh “Add User” → clear the form
          formik.resetForm();
        }

        if (!open) {
          // dialog closed → clear edit flags
          setIsEditMode(false);
          setEditingUserId(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-[150px]">
          <Plus className="w-4 h-4 mr-1" /> Tambah Kategori
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Kategori' : 'Tambah Kategori'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Edit detail kategori' : 'Isi detail kategori baru.'}
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
              placeholder="Masukkan nama kategori"
              value={formik.values.nama}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.nama && formik.errors.nama && (
              <p className="text-xs text-red-600">{formik.errors.nama}</p>
            )}
          </div>
          <div className="space-y-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Deskripsi</label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              rows={3}
              value={formik.values.deskripsi}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Masukkan deskripsi diskon"
              className="w-full bg-white rounded-md border  px-3 py-2 text-sm focus:outline-none "
            />
            {formik.touched.deskripsi && formik.errors.deskripsi && (
              <p className="text-xs text-red-600">{formik.errors.deskripsi}</p>
            )}
          </div>
          </div>

          {/* <div className="space-y-2">
            <label
              htmlFor="gambar"
              className="text-sm font-medium text-gray-700"
            >
              URL Gambar
            </label>
            <Input
              id="gambar"
              name="gambar"
              placeholder="Masukkan URL gambar"
              value={formik.values.gambar}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.gambar && formik.errors.gambar && (
              <p className="text-xs text-red-600">{formik.errors.gambar}</p>
            )}
          </div> */}
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                formik.resetForm();
                setDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? 'Simpan Perubahan' : 'Tambah Kategori'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
