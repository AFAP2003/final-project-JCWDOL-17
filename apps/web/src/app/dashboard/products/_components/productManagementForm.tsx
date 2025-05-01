import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from '@/components/ui/select';
import { MyFormValues } from '@/validations/user.validation';
import { Plus } from 'lucide-react';
import { FormikProps } from 'formik';

interface ProductManagementFormProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  formik: FormikProps<MyFormValues>;
  isEditMode: boolean;
  categories: any[];
}
export default function ProductManagementForm({
  formik,
  dialogOpen,
  setDialogOpen,
  isEditMode,
  categories,
}: ProductManagementFormProps) {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-[150px]">
          <Plus className="w-4 h-4 mr-1" />
          {isEditMode ? 'Edit Produk' : 'Tambah Produk'}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] sm:max-h-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Produk Baru</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Isi detail di bawah ini untuk mengedit.'
              : 'Isi detail di bawah ini untuk menambah produk.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="grid gap-4 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nama Produk
            </label>
            <Input
              id="nama"
              name="nama"
              placeholder="Masukkan nama produk"
              value={formik.values.nama}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.nama && formik.errors.nama && (
              <p className="text-xs text-red-600">{formik.errors.nama}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Kategori</label>
            <Select
              value={formik.values.kategoriId || undefined}
              onValueChange={(v) => formik.setFieldValue('kategoriId', v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Kategori</SelectLabel>
                  {categories.map((category) => (
                    <SelectItem value={category.name} key={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {formik.touched.kategoriId && formik.errors.kategoriId && (
              <p className="text-xs text-red-600">{formik.errors.kategoriId}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Harga</label>
            <Input
              id="harga"
              name="harga"
              type="number"
              placeholder="0.00"
              value={formik.values.harga}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.harga && formik.errors.harga && (
              <p className="text-xs text-red-600">{formik.errors.harga}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Deskripsi</label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              rows={3}
              value={formik.values.deskripsi}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Masukkan deskripsi produk"
              className="w-full bg-white rounded-md border  px-3 py-2 text-sm focus:outline-none "
            />
            {formik.touched.deskripsi && formik.errors.deskripsi && (
              <p className="text-xs text-red-600">{formik.errors.deskripsi}</p>
            )}
          </div>

          {/* foto */}
          {/* <div>
              <label className="mb-1 block text-sm font-medium">Foto</label>
              <Input
                id="images"
                name="images"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.gif"
                onChange={e =>
                  formik.setFieldValue('images', e.currentTarget.files)
                }
              />
              {formik.touched.images && formik.errors.images && (
                <p className="text-xs text-red-600">{formik.errors.images}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, JPEG, PNG, GIF. Max size: 1MB.
              </p>
            </div> */}

          {/* toko */}
          {/* <div>
              <label className="mb-1 block text-sm font-medium">Toko</label>
              <Select
                value={formik.values.storeId}
                onValueChange={v => formik.setFieldValue('storeId', v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Toko" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Toko</SelectLabel>
                    <SelectItem value="1">Jakarta Store</SelectItem>
                    <SelectItem value="2">Surabaya Store</SelectItem>
                    <SelectItem value="3">Medan Store</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {formik.touched.storeId && formik.errors.storeId && (
                <p className="text-xs text-red-600">{formik.errors.storeId}</p>
              )}
            </div> */}

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                formik.resetForm()
                setDialogOpen(false)}}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? 'Simpan Perubahan' : 'Tambah Produk'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
