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
import UseDiscountManagement from '@/hooks/useDiscountManagement';
import { Store } from '@/lib/interfaces/storeManagement.interface';
import { FormikProps } from 'formik';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
interface DiscountManagementFormProps {
  formik: FormikProps<any>;
  stores: Store[];
  setDialogOpen: (open: boolean) => void;
  isEditMode: boolean;
  dialogOpen: boolean;
  setIsEditMode: (edit: boolean) => void;
  setEditingDiscountId: (id: string | null) => void;
  isDetailMode: boolean;
  setIsDetailMode: (detail: boolean) => void;
}
export default function DiscountManagementForm({
  formik,
  stores,
  setDialogOpen,
  isEditMode,
  dialogOpen,
  setIsEditMode,
  setEditingDiscountId,
  isDetailMode,
  setIsDetailMode,
}: DiscountManagementFormProps) {
  const disabled = isDetailMode;

  const type = formik.values.tipe_diskon;
  const [disableValue, setDisableValue] = useState(false);
  const [disableMinPembelian, setDisableMinPembelian] = useState(false);
  const [disablePotonganMaks, setDisablePotonganMaks] = useState(false);
  const [disableTipeNilaiDiskon, setDisableTipeNilaiDiskon] = useState(false);
  const { isSessionLoading, user } = UseDiscountManagement();

  useEffect(() => {
    if (type == 'diskon_normal') {
      formik.setFieldValue('min_pembelian', '');
      formik.setFieldValue('potongan_maks', '');
      setDisableMinPembelian(true);
      setDisablePotonganMaks(true);
    } else if (type == 'bogo') {
      formik.setFieldValue('tipe_nilai_diskon', '');
      formik.setFieldValue('nilai_diskon', '');
      formik.setFieldValue('min_pembelian', '');
      formik.setFieldValue('potongan_maks', '');
      setDisableTipeNilaiDiskon(true);
      setDisableValue(true);
      setDisableMinPembelian(true);
      setDisablePotonganMaks(true);
    } else {
      setDisableTipeNilaiDiskon(false);
      setDisableValue(false);

      setDisableMinPembelian(false);
      setDisablePotonganMaks(false);
    }
  }, [type]);

  if (isSessionLoading) {
    return <div></div>;
  }

  if (!user) return <div></div>;
  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        // if opening fresh (not edit), reset all fields
        if (open && !isEditMode) {
          formik.resetForm();
          setIsDetailMode(false);
        }
        // closing always clears edit state
        if (!open) {
          setIsEditMode(false);
          setEditingDiscountId(null);
          setIsDetailMode(false);
        }
        setDialogOpen(open);
      }}
    >
      {user.role == 'ADMIN' && (
        <DialogTrigger asChild>
          <Button className="w-[150px]">
            <Plus className="w-4 h-4 mr-1" />
            Tambah Diskon
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-h-[90vh] w-[95%] sm:w-full bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isDetailMode
              ? 'Lihat Diskon'
              : isEditMode
                ? 'Edit Diskon'
                : 'Tambah Diskon Baru'}
          </DialogTitle>
          <DialogDescription className={isDetailMode ? 'hidden' : 'block'}>
            {isEditMode
              ? 'Edit detail diskon di bawah ini.'
              : 'Isi detail diskon di bawah ini.'}
          </DialogDescription>
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
              disabled={disabled}
            />
            {formik.touched.nama && formik.errors.nama && (
              <p className="text-xs text-red-600">{formik.errors.nama}</p>
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
              disabled={disabled}
            />
            {formik.touched.deskripsi && formik.errors.deskripsi && (
              <p className="text-xs text-red-600">{formik.errors.deskripsi}</p>
            )}
          </div>

          {user.role == 'SUPER' && (
            <div>
              <label className="mb-1 block text-sm font-medium">Toko</label>
              <Select
                value={formik.values.toko}
                onValueChange={(v) => formik.setFieldValue('toko', v)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih toko" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Pilih Toko</SelectLabel>
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
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">
              Tipe Diskon
            </label>
            <Select
              value={formik.values.tipe_diskon}
              onValueChange={(v) => formik.setFieldValue('tipe_diskon', v)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe diskon" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tipe Diskon</SelectLabel>
                  <SelectItem value="diskon_normal">Diskon Normal</SelectItem>
                  <SelectItem value="diskon_syarat">
                    Diskon dengan Minimal Perbelanjaan dan Limitasi Nilai
                  </SelectItem>
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
              onValueChange={(v) =>
                formik.setFieldValue('tipe_nilai_diskon', v)
              }
              disabled={disabled || disableTipeNilaiDiskon}
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
            {formik.touched.tipe_nilai_diskon &&
              formik.errors.tipe_nilai_diskon && (
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
              onBlur={formik.handleBlur}
              disabled={disabled || disableValue}
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
              placeholder="Masukkan minimal pembelian"
              value={formik.values.min_pembelian}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={disabled || disableMinPembelian}
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
              placeholder="Masukkan potongan maksmimal"
              value={formik.values.potongan_maks}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={disabled || disablePotonganMaks}
            />
            {formik.touched.potongan_maks && formik.errors.potongan_maks && (
              <p className="text-xs text-red-600">
                {formik.errors.potongan_maks}
              </p>
            )}
          </div>

      

          <div>
            <label className="mb-1 block text-sm font-medium">
              Tanggal Mulai
            </label>
            <Input
              name="tanggal_mulai"
              type="date"
              value={formik.values.tanggal_mulai}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={disabled}
            />
            {formik.touched.tanggal_mulai && formik.errors.tanggal_mulai && (
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
              onBlur={formik.handleBlur}
              disabled={disabled}
            />
            {formik.touched.kadaluwarsa && formik.errors.kadaluwarsa && (
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
                formik.resetForm();
                setDialogOpen(false);
              }}
              className={isDetailMode ? 'hidden' : 'block'}
            >
              Cancel
            </Button>
            <Button type="submit" className={isDetailMode ? 'hidden' : 'block'}>
              {isEditMode ? 'Simpan Perubahan' : 'Tambah Diskon'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
