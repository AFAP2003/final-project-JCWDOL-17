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
import { MyFormValues } from '@/validations/user.validation';
import { Plus } from 'lucide-react';
import { FormikProps } from 'formik';
import { Product } from '@/lib/interfaces/productManagement.interface';
import { Store } from '@/lib/interfaces/storeManagement.interface';
import { useEffect, useState } from 'react';
import UseInventoryManagement from '@/hooks/useInventoryManagement';

interface InventoryManagementFormProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  formik: FormikProps<any>;
  isEditMode: boolean;
  products: Product[];
  stores: Store[];
  setIsEditMode: (edit: boolean) => void;
  setEditingInventoryId: (id: string | null) => void;

}
export default function InventoryManagementForm({
  dialogOpen,
  setDialogOpen,
  products,
  stores,
  formik,
  isEditMode,
  setIsEditMode,
  setEditingInventoryId
}: InventoryManagementFormProps) {
  const {inventories} = UseInventoryManagement()
  const [activeTab, setActiveTab] = useState<'tambah' | 'kurangi'>('tambah');

  useEffect(() => {
    const add = Number(formik.values.tambah || 0);
    const reduce = Number(formik.values.kurangi || 0);
  
    const matchedInventory = inventories.find(
      (inv) =>
        inv.productId === formik.values.produk &&
        inv.storeId === formik.values.toko
    );
  
    const stokSekarang = matchedInventory ? matchedInventory.quantity : 0;
  
    let stokBaru = stokSekarang;
    if (activeTab === 'tambah') {
      stokBaru = stokSekarang + add;
    } else {
      stokBaru = Math.max(stokSekarang - reduce, 0);
    }
  
    formik.setFieldValue('sekarang', stokSekarang);
    formik.setFieldValue('baru', stokBaru);
  }, [
    formik.values.tambah,
    formik.values.kurangi,
    formik.values.produk,
    formik.values.toko,
    activeTab, // <- include this in deps
    inventories,
  ]);
  
  
  return (

    <Dialog open={dialogOpen} 
    onOpenChange={(open) => {
      // if opening fresh (not edit), reset all fields
      if (open && !isEditMode) {
        formik.resetForm();
      }
      // closing always clears edit state
      if (!open) {
        setIsEditMode(false);
        setEditingInventoryId(null);
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
      <DialogContent className="max-h-[90vh] sm:max-h-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode?'Edit Stok':'Perbarui Stok'}</DialogTitle>
          <DialogDescription>
            {isEditMode?'Isi detail di bawah ini untuk edit stok.':'Isi detail di bawah ini untuk perbarui stok.'}
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
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Produk</SelectLabel>
                    {products.map((product) => (
                      <SelectItem value={product.id} key={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {formik.touched.produk && formik.errors.produk && (
                <p className="text-xs text-red-600">
                  {formik.errors.produk as string}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Toko
              </label>
              <Select
                value={formik.values.toko || undefined}
                onValueChange={(v) => formik.setFieldValue('toko', v)}
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
            <Tabs defaultValue="tambah"
 value={formik.values.mode} 
 onValueChange={(newMode) => {
  formik.setFieldValue('mode', newMode); // ← write back into Formik

  setActiveTab(newMode as 'tambah' | 'kurangi')

  if (newMode === 'tambah') {
    formik.setFieldValue('kurangi', '');
  } else {
    formik.setFieldValue('tambah', '');
  }
}}>            
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
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Stok Baru
              </label>
              <Input type="number" 
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
              />
              {formik.touched.minimal && formik.errors.minimal && (
                <p className="text-xs text-red-600">
                  {formik.errors.minimal as string}
                </p>
              )}
            </div>
            {/* <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Catatan
            </label>
            <textarea
              placeholder="Masukkan alasan kenapa merubah kuantitas"
              className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none "
              rows={2}
            />
          </div> */}
          </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              formik.resetForm();
              setDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button type='submit'>{isEditMode?'Simpan Perubahan':'Perbarui Stok'}</Button>
        </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>

  );
}
