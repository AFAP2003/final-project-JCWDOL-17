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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from '@/components/ui/select';
import { Store } from '@/lib/interfaces/storeManagement.interface';
import { FormikProps } from 'formik';
import { Plus } from 'lucide-react';
interface DiscountManagementFormProps{
  formik: FormikProps<any>
  stores:Store[]
  setDialogOpen: (open: boolean) => void;
  isEditMode:boolean
  dialogOpen:boolean
  setIsEditMode: (edit: boolean) => void;
  setEditingDiscountId: (id: string | null) => void;

}
export default function DiscountManagementForm({ formik,stores,setDialogOpen ,isEditMode,dialogOpen,setIsEditMode,setEditingDiscountId}:DiscountManagementFormProps) {
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
        setEditingDiscountId(null);
      }
      setDialogOpen(open);
    }}>
      <DialogTrigger asChild>
        <Button className="w-[150px]">
          <Plus className="w-4 h-4 mr-1" />
          Tambah Diskon
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode?'Edit Diskon':'Tambah Diskon Baru'}</DialogTitle>
          <DialogDescription>{isEditMode?'Edit detail diskon di bawah ini.':'Isi detail diskon di bawah ini.'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="grid gap-4 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nama Diskon
            </label>
            <Input
              name="nama"
              placeholder="Masukkan nama diskon"
              value={formik.values.nama}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.nama && formik.errors.nama && (
              <p className="text-xs text-red-600">
                {formik.errors.nama}
              </p>
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
              placeholder="Masukkan deskripsi diskon"
              className="w-full bg-white rounded-md border  px-3 py-2 text-sm focus:outline-none "
            />
            {formik.touched.deskripsi && formik.errors.deskripsi && (
              <p className="text-xs text-red-600">{formik.errors.deskripsi}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Toko
            </label>
            <Select
              value={formik.values.toko}
              onValueChange={(v) => formik.setFieldValue('toko', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih toko" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Pilih Toko</SelectLabel>
                 {
                    stores.map((store)=>(
                      <SelectItem value={store.id} key={store.id}>{store.name}</SelectItem>

                    ))
                 }
                </SelectGroup>
              </SelectContent>
            </Select>
            {formik.touched.toko && formik.errors.toko && (
              <p className="text-xs text-red-600">
                {formik.errors.toko}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Tipe Diskon
            </label>
            <Select
              value={formik.values.tipe_diskon}
              onValueChange={(v) => formik.setFieldValue('tipe_diskon', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe diskon" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tipe Diskon</SelectLabel>
                  <SelectItem value="diskon_normal">Diskon Normal</SelectItem>
                  <SelectItem value="diskon_syarat">Diskon dengan Minimal Perbelanjaan dan Limitasi Nilai</SelectItem>
                  <SelectItem value="bogo">Beli 1 Gratis 1</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {formik.touched.tipe_diskon && formik.errors.tipe_diskon && (
              <p className="text-xs text-red-600">
                {formik.errors.tipe_diskon}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Tipe Nilai Diskon
            </label>
            <Select
              value={formik.values.tipe_nilai_diskon}
              onValueChange={(v) => formik.setFieldValue('tipe_nilai_diskon', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe diskon" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tipe Nilai Diskon</SelectLabel>
                  <SelectItem value="percentage">Persentase</SelectItem>
                  <SelectItem value="nominal">Nominal</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {formik.touched.tipe_nilai_diskon && formik.errors.tipe_nilai_diskon && (
              <p className="text-xs text-red-600">
                {formik.errors.tipe_nilai_diskon}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nilai Diskon
            </label>
            <Input
              name="nilai_diskon"
              type="number"
              placeholder="Masukkan nilai diskon"
              value={formik.values.nilai_diskon}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}            />
            {formik.touched.nilai_diskon && formik.errors.nilai_diskon && (
              <p className="text-xs text-red-600">
                {formik.errors.nilai_diskon}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Minimal Pembelian
            </label>
            <Input
              name="min_pembelian"
              type="number"
              placeholder="Masukkan minimal pembelian"
              value={formik.values.min_pembelian}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}            />
            {formik.touched.min_pembelian && formik.errors.min_pembelian && (
              <p className="text-xs text-red-600">
                {formik.errors.min_pembelian}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Potongan Maksimal
            </label>
            <Input
              name="potongan_maks"
              type="number"
              placeholder="Masukkan potongan maksmimal"
              value={formik.values.potongan_maks}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}            />
            {formik.touched.potongan_maks && formik.errors.potongan_maks && (
              <p className="text-xs text-red-600">
                {formik.errors.potongan_maks}
              </p>
            )}
          </div>

          {/* <div>
            <label className="mb-1 block text-sm font-medium">
              Kode Voucher
            </label>
            <Input
              name="kode_voucher"
              placeholder="Opsional"
              {...formik.getFieldProps('kode_voucher')}
            />
          </div> */}

          {/* <div>
            <label className="mb-1 block text-sm font-medium">
              Batas Penggunaan
            </label>
            <Input
              name="batas_penggunaan"
              type="number"
              placeholder="Masukkan batas penggunaan"
              value={formik.values.batas_penggunaan}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}            />
            {formik.touched.batas_penggunaan &&
              formik.errors.batas_penggunaan && (
                <p className="text-xs text-red-600">
                  {formik.errors.batas_penggunaan}
                </p>
              )}
          </div> */}
            
          <div>
            <label className="mb-1 block text-sm font-medium">
              Tanggal Mulai
            </label>
            <Input
              name="tanggal_mulai"
              type="date"
              value={formik.values.tanggal_mulai}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}            />
                {formik.touched.tanggal_mulai &&
              formik.errors.tanggal_mulai && (
                <p className="text-xs text-red-600">
                  {formik.errors.tanggal_mulai}
                </p>
              )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Tanggal Kadaluarsa
            </label>
            <Input
              name="kadaluwarsa"
              type="date"
              value={formik.values.kadaluwarsa}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}            />
                {formik.touched.kadaluwarsa &&
              formik.errors.kadaluwarsa && (
                <p className="text-xs text-red-600">
                  {formik.errors.kadaluwarsa}
                </p>
              )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                formik.resetForm()
                setDialogOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit">{isEditMode?'Simpan Perubahan':'Tambah Diskon'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
