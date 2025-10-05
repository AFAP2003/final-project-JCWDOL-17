import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCategoryManagement } from '@/hooks/useCategoryManagement';
import { MyFormValues } from '@/validations/user.validation';
import { FormikProps } from 'formik';
import { Plus } from 'lucide-react';

interface CategoryManagementFormProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  formik: FormikProps<MyFormValues>;
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
  setEditingCategoryId: (id: string | null) => void;
  isDetailMode: boolean;
  setIsDetailMode: (detail: boolean) => void;
}
export default function CategoryManagementForm({
  formik,
  dialogOpen,
  setDialogOpen,
  isEditMode,
  setIsEditMode,
  setEditingCategoryId,
  isDetailMode,
  setIsDetailMode,
}: CategoryManagementFormProps) {
  const disabled = isDetailMode;
  const { isSessionLoading, user } = useCategoryManagement();

  if (isSessionLoading) {
    return <div></div>;
  }

  if (!user) return <div></div>;

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        // update the open state

        if (open && !isEditMode) {
          // fresh “Add User” → clear the form
          formik.resetForm();
          setIsDetailMode(false);
        }

        if (!open) {
          // dialog closed → clear edit flags
          setIsEditMode(false);
          setEditingCategoryId(null);
          setIsDetailMode(false);
        }
        setDialogOpen(open);
      }}
    >
      {user.role == 'SUPER' && (
        <DialogTrigger asChild>
          <Button className="w-[150px]">
            <Plus className="w-4 h-4 mr-1" /> Tambah Kategori
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className='max-w-[95%]'>
        <DialogHeader>
          <DialogTitle>
            {isDetailMode
              ? 'Lihat Kategori'
              : isEditMode
                ? 'Edit Kategori'
                : 'Tambah Kategori'}
          </DialogTitle>
          <DialogDescription className={`${isDetailMode ? 'hidden' : 'block'}`}>
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
              disabled={disabled}
            />
            {formik.touched.nama && formik.errors.nama && (
              <p className="text-xs text-red-600">{formik.errors.nama}</p>
            )}
          </div>
          <div className="space-y-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Deskripsi
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                rows={3}
                value={formik.values.deskripsi}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Masukkan deskripsi diskon"
                className="w-full bg-white rounded-md border  px-3 py-2 text-sm focus:outline-none "
                disabled={disabled}
              />
              {formik.touched.deskripsi && formik.errors.deskripsi && (
                <p className="text-xs text-red-600">
                  {formik.errors.deskripsi}
                </p>
              )}
            </div>
          </div>

          <DialogFooter
            className={`${isDetailMode} ? 'hidden' : 'block' flex justify-end gap-2 sm:gap-0`}
          >
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                formik.resetForm();
                setDialogOpen(false);
              }}
              className={isDetailMode ? 'hidden' : 'block'}
            >
              Cancel
            </Button>
            <Button type="submit" className={isDetailMode ? 'hidden' : 'block'}>
              {isEditMode ? 'Simpan Perubahan' : 'Tambah Kategori'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
