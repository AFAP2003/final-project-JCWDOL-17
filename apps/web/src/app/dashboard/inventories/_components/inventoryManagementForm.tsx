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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UseInventoryManagement from '@/hooks/useInventoryManagement';
import { Product } from '@/lib/interfaces/productManagement.interface';
import { Store } from '@/lib/interfaces/storeManagement.interface';
import { FormikProps } from 'formik';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface InventoryManagementFormProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  formik: FormikProps<any>;
  isEditMode: boolean;
  products: Product[];
  stores: Store[];
  setIsEditMode: (edit: boolean) => void;
  setEditingInventoryId: (id: string | null) => void;
  isDetailMode: boolean;
  setIsDetailMode: (detail: boolean) => void;
}
export default function InventoryManagementForm({
  dialogOpen,
  setDialogOpen,
  products,
  stores,
  formik,
  isEditMode,
  setIsEditMode,
  setEditingInventoryId,
  isDetailMode,
  setIsDetailMode,
}: InventoryManagementFormProps) {
  const [activeTab, setActiveTab] = useState<'tambah' | 'kurangi'>('tambah');
  const [initialValuesSet, setInitialValuesSet] = useState(false);
  const { user, isSessionLoading, inventories, storeByAdmin } =
    UseInventoryManagement();
  if (isSessionLoading) {
    return <div></div>;
  }

  if (!user) return <div></div>;

  const availableProducts = products;
  useEffect(() => {
    const productId = formik.values.produk;
    const storeId =
      user.role === 'ADMIN' ? storeByAdmin?.id : formik.values.toko;

    if (!productId || !storeId) {
      formik.setFieldValue('sekarang', 0);
      formik.setFieldValue('baru', 0);
      formik.setFieldValue('minimal', '');
      return;
    }

    const inv = inventories.find(
      (inv) => inv.productId === productId && inv.storeId === storeId,
    );

    const currentQty = inv ? inv.quantity : 0;
    const minStock = inv ? inv.minStock : '';

    formik.setFieldValue('sekarang', currentQty);
    formik.setFieldValue('baru', currentQty);
    formik.setFieldValue('minimal', minStock);
  }, [
    formik.values.produk,
    formik.values.toko,
    user.role,
    user.storeId,
    inventories,
  ]);

  useEffect(() => {
    const current = Number(formik.values.sekarang) || 0;
    const tambah = Number(formik.values.tambah) || 0;
    const kurangi = Number(formik.values.kurangi) || 0;

    let baru = current;

    if (formik.values.mode === 'tambah') {
      baru = current + tambah;
    } else if (formik.values.mode === 'kurangi') {
      baru = Math.max(0, current - kurangi);
    }

    formik.setFieldValue('baru', baru);
  }, [
    formik.values.sekarang,
    formik.values.tambah,
    formik.values.kurangi,
    formik.values.mode,
  ]);

  const disabled = isDetailMode;
  const disableSelect = isEditMode || isDetailMode;

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (open) {
          // always reset to “create” mode on open:
          setIsEditMode(false);
          setEditingInventoryId(null);
          setIsDetailMode(false);
          formik.resetForm();
          setInitialValuesSet(false);
        } else {
          // also clear when closing:
          setIsEditMode(false);
          setEditingInventoryId(null);
          setIsDetailMode(false);
          setInitialValuesSet(false);
        }
        setDialogOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-[150px]">
          <Plus className="w-4 h-4 mr-1" />
          Perbarui Stok
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[95%] sm:w-full sm:max-h-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isDetailMode
              ? 'Lihat Stok'
              : isEditMode
                ? 'Edit Stok'
                : 'Perbarui Stok'}
          </DialogTitle>
          <DialogDescription className={isDetailMode ? 'hidden' : 'block'}>
            {isEditMode
              ? 'Isi detail di bawah ini untuk edit stok.'
              : 'Isi detail di bawah ini untuk perbarui stok.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Produk
              </label>
              <Select
                value={formik.values.produk || undefined}
                onValueChange={(v) => formik.setFieldValue('produk', v)}
                disabled={disableSelect}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Produk</SelectLabel>
                    {availableProducts.length > 0 ? (
                      availableProducts.map((product) => (
                        <SelectItem value={product.id} key={product.id}>
                          {product.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="nothing" disabled>
                        Tidak ada produk yang tersedia
                      </SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {formik.touched.produk && formik.errors.produk && (
                <p className="text-xs text-red-600">
                  {formik.errors.produk as string}
                </p>
              )}
            </div>
            {user.role == 'SUPER' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Toko
                </label>
                <Select
                  value={formik.values.toko || undefined}
                  onValueChange={(v) => formik.setFieldValue('toko', v)}
                  disabled={disableSelect}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Toko" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Toko</SelectLabel>
                      {stores.map((store) => (
                        <SelectItem value={store.id} key={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {formik.touched.toko && formik.errors.toko && (
                  <p className="text-xs text-red-600">
                    {formik.errors.toko as string}
                  </p>
                )}
              </div>
            )}
            <Tabs
              className={isDetailMode ? 'hidden' : 'block'}
              defaultValue="tambah"
              value={formik.values.mode}
              onValueChange={(newMode) => {
                formik.setFieldValue('mode', newMode); // ← write back into Formik

                setActiveTab(newMode as 'tambah' | 'kurangi');

                if (newMode === 'tambah') {
                  formik.setFieldValue('kurangi', '');
                } else {
                  formik.setFieldValue('tambah', '');
                }
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tambah">Tambah Stok</TabsTrigger>
                <TabsTrigger value="kurangi">Kurangi Stok</TabsTrigger>
              </TabsList>
              <TabsContent value="tambah">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tambah Stok
                  </label>
                  <Input
                    type="number"
                    name="tambah"
                    value={formik.values.tambah}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Masukkan Kuantitas"
                  />
                  {formik.touched.tambah && formik.errors.tambah && (
                    <p className="text-xs text-red-600">
                      {formik.errors.tambah as string}
                    </p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="kurangi">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Kurangi Stok
                  </label>
                  <Input
                    type="number"
                    name="kurangi"
                    value={formik.values.kurangi}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Masukkan Kuantitas"
                  />
                  {formik.touched.kurangi && formik.errors.kurangi && (
                    <p className="text-xs text-red-600">
                      {formik.errors.kurangi as string}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Stok Sekarang
              </label>
              <Input
                type="number"
                value={formik.values.sekarang}
                readOnly
                disabled
              />
            </div>
            <div className={isDetailMode ? 'hidden' : 'block'}>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Stok Baru
              </label>
              <Input
                type="number"
                value={formik.values.baru}
                readOnly
                disabled
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Minimal Stok
              </label>
              <Input
                type="number"
                name="minimal"
                value={formik.values.minimal}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Masukkan Minimal Stok"
                disabled={disabled}
              />
              {formik.touched.minimal && formik.errors.minimal && (
                <p className="text-xs text-red-600">
                  {formik.errors.minimal as string}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                formik.resetForm();
                setDialogOpen(false);
              }}
              className={isDetailMode ? 'hidden' : 'block'}
            >
              Cancel
            </Button>
            <Button type="submit" className={isDetailMode ? 'hidden' : 'block'}>
              {isEditMode ? 'Simpan Perubahan' : 'Perbarui Stok'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
