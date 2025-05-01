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
import { Plus } from 'lucide-react';
export default function DiscountManagementForm({ formik }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-[150px]">
          <Plus className="w-4 h-4 mr-1" />
          Tambah Diskon
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Tambah Diskon Baru</DialogTitle>
          <DialogDescription>Isi detail diskon di bawah ini.</DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="grid gap-4 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nama Diskon
            </label>
            <Input
              name="nama_diskon"
              placeholder="Contoh: Diskon Tahun Baru"
              {...formik.getFieldProps('nama_diskon')}
            />
            {formik.touched.nama_diskon && formik.errors.nama_diskon && (
              <p className="text-xs text-red-600">
                {formik.errors.nama_diskon}
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
                  <SelectLabel>Tipe</SelectLabel>
                  <SelectItem value="percentage">Persentase</SelectItem>
                  <SelectItem value="nominal">Nominal</SelectItem>
                  <SelectItem value="bogo">BOGO</SelectItem>
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
              Nilai Diskon
            </label>
            <Input
              name="nilai_diskon"
              type="number"
              placeholder="15 untuk 15% / 20000 untuk Rp 20.000"
              {...formik.getFieldProps('nilai_diskon')}
            />
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
              placeholder="0 jika tidak ada"
              {...formik.getFieldProps('min_pembelian')}
            />
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
              placeholder="0 jika tidak ada"
              {...formik.getFieldProps('potongan_maks')}
            />
            {formik.touched.potongan_maks && formik.errors.potongan_maks && (
              <p className="text-xs text-red-600">
                {formik.errors.potongan_maks}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Kode Voucher
            </label>
            <Input
              name="kode_voucher"
              placeholder="Opsional"
              {...formik.getFieldProps('kode_voucher')}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Batas Penggunaan
            </label>
            <Input
              name="batas_penggunaan"
              type="number"
              placeholder="0 = tidak terbatas"
              {...formik.getFieldProps('batas_penggunaan')}
            />
            {formik.touched.batas_penggunaan &&
              formik.errors.batas_penggunaan && (
                <p className="text-xs text-red-600">
                  {formik.errors.batas_penggunaan}
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
              {...formik.getFieldProps('kadaluwarsa')}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => formik.resetForm()}
            >
              Cancel
            </Button>
            <Button type="submit">Tambah Diskon</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
