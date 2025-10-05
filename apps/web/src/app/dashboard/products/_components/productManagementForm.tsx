import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import UseProductManagement from '@/hooks/useProductManagement';
import { MyFormValues } from '@/validations/user.validation';
import { FormikProps } from 'formik';
import { Plus } from 'lucide-react';

interface ProductManagementFormProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  formik: FormikProps<MyFormValues>;
  isEditMode: boolean;
  categories: any[];
  setIsEditMode: (value: boolean) => void;
  setEditingProductId: (id: string | null) => void;
  previews: string[];
  setPreviews: (any: any) => any[];
  mainIndex: number;
  setMainIndex: (index: number) => void;
  isDetailMode: boolean;
  setIsDetailMode: (detail: boolean) => void;
}
export default function ProductManagementForm({
  formik,
  dialogOpen,
  setDialogOpen,
  isEditMode,
  categories,
  setIsEditMode,
  setEditingProductId,
  previews,
  setPreviews,
  mainIndex,
  setMainIndex,
  isDetailMode,
  setIsDetailMode,
}: ProductManagementFormProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.currentTarget.files || []);
    const existingFiles = Array.from(formik.values.image || []);
    const combinedFiles = [...existingFiles, ...selectedFiles];

    formik.setFieldValue('image', combinedFiles);

    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemove = (index: number) => {
    const updatedPreviews = [...previews];
    const removedPreview = updatedPreviews.splice(index, 1)[0]; // get the removed one
    setPreviews(updatedPreviews);

    const updatedFiles = [...formik.values.image];
    const numPreviews = previews.length;
    const numUploaded = formik.values.image.length;

    const imageIndex = index - (numPreviews - numUploaded);

    if (imageIndex >= 0) {
      // This is a new uploaded file, remove from Formik image field
      updatedFiles.splice(imageIndex, 1);
      formik.setFieldValue('image', updatedFiles);
    } else {
      // This is a previously uploaded image (keptImages)
      const updatedKeptImages = formik.values.keptImages.filter(
        (url: string, i: number) => i !== index,
      );
      formik.setFieldValue('keptImages', updatedKeptImages);
    }

    // Adjust main image index
    if (index === mainIndex) setMainIndex(0);
    else if (index < mainIndex) setMainIndex((prev) => prev - 1);
  };

  const disabled = isDetailMode;
  const { isSessionLoading, user } = UseProductManagement();

  if (isSessionLoading) {
    return <div></div>;
  }

  if (!user) return <div></div>;

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        // when opening in “add” mode, reset the form
        if (open && !isEditMode) {
          formik.resetForm();
          setPreviews([]);
          setMainIndex(0);
          setIsDetailMode(false);
        }

        // when closing, clear edit state
        if (!open) {
          setIsEditMode(false);
          setEditingProductId(null);
          setPreviews([]);
          setMainIndex(0);
          setIsDetailMode(false);
        }

        setDialogOpen(open);
      }}
    >
      {user.role == 'SUPER' && (
        <DialogTrigger asChild>
          <Button
            className="w-[150px]"
            onClick={() => {
              // ALWAYS clear form state before opening “add” mode
              setIsEditMode(false);
              setIsDetailMode(false);
              formik.resetForm();
              setPreviews([]);
              setMainIndex(0);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Tambah Produk
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] w-[95%] sm:w-full sm:max-h-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}
          </DialogTitle>
          <DialogDescription className={isDetailMode ? 'hidden' : 'block'}>
            {isEditMode
              ? 'Isi detail di bawah ini untuk mengedit.'
              : 'Isi detail di bawah ini untuk menambah produk.'}
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
              multiple
              accept=".jpg,.jpeg,.png,.gif"
              onChange={handleFileChange}
              disabled={disabled}
            />

            {formik.touched.image && formik.errors.image && (
              <p className="text-xs text-red-600">{formik.errors.image}</p>
            )}

            <p className="text-xs text-gray-500 mt-1">
              Format yang didukung: JPG, JPEG, PNG, GIF. Ukuran maks.: 1MB.
            </p>

            {/* Image Preview Grid */}
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

                  {index === mainIndex && (
                    <Badge className="absolute top-1 left-1 z-10">Main</Badge>
                  )}

                  <div
                    className={`${isDetailMode ? 'hidden' : 'block'} absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex flex-col justify-center items-center space-y-2 transition`}
                  >
                    {index !== mainIndex && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          // update both your local preview state...
                          setMainIndex(index);
                          // ...and Formik’s value so it gets sent in the formData
                          formik.setFieldValue('mainIndex', index);
                        }}
                      >
                        Set as Main
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemove(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
              disabled={disabled}
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
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Kategori</SelectLabel>
                  {categories.map((category) => (
                    <SelectItem value={category.id} key={category.id}>
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
              disabled={disabled}
            />
            {formik.touched.harga && formik.errors.harga && (
              <p className="text-xs text-red-600">{formik.errors.harga}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">SKU</label>
            <Input
              id="sku"
              name="sku"
              placeholder="Masukkan nama produk"
              value={formik.values.sku}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={disabled}
            />
            {formik.touched.sku && formik.errors.sku && (
              <p className="text-xs text-red-600">{formik.errors.sku}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Berat</label>
            <Input
              id="berat"
              name="berat"
              type="number"
              placeholder="0.00"
              value={formik.values.berat}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={disabled}
            />
            {formik.touched.berat && formik.errors.berat && (
              <p className="text-xs text-red-600">{formik.errors.berat}</p>
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
              disabled={disabled}
            />
            {formik.touched.deskripsi && formik.errors.deskripsi && (
              <p className="text-xs text-red-600">{formik.errors.deskripsi}</p>
            )}
          </div>

          <DialogFooter className={`flex justify-end gap-2 `}>
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
              {isEditMode ? 'Simpan Perubahan' : 'Tambah Produk'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
