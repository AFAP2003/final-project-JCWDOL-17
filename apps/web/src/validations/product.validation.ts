import * as Yup from 'yup';
export interface MyFormValues {
  nama: string;
  deskripsi: string;
  kategoriId: string;
  harga: number;
  berat: number;
  sku: string;
  isActive: boolean;
}
export const getValidationSchema = () =>
  Yup.object<MyFormValues>().shape({
    nama: Yup.string()
      .required('Nama produk wajib diisi')
      .trim()
      .min(2, 'Nama produk setidaknya harus 2 karakter')
      .max(100, 'Nama produk maksimal harus 100 karakter'),
    deskripsi: Yup.string()
      .required('Deskripsi wajib diisi')
      .max(5000, 'Maksimal 5000 karakter'),
    harga: Yup.number()
      .typeError('Harga harus diisi angka')
      .positive('Harga harus lebih dari 0')
      .required('Harga wajib diisi'),
    berat: Yup.number()
      .required('Berat wajib diisi')
      .positive('Berat harus angka positif'),
    sku: Yup.string()
      .required('SKU wajib diisi')
      .max(50, 'Nama produk maksimal harus 100 karakter'),
    isActive: Yup.boolean(),
    kategoriId: Yup.string().required('Kategori wajib dipilih'),
  });
