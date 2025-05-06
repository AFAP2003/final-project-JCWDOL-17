import * as Yup from 'yup';
export interface MyFormValues {
  nama: string;
  deskripsi: string;
  kategoriId: string;
  harga: number;
  berat:number
  sku:string
  isActive:boolean
}
export const getValidationSchema = ()=>
    Yup.object<MyFormValues>().shape({
        nama: Yup.string().required('Nama produk wajib diisi').trim().min(2,'Nama produk setidaknya harus 2 karakter').max(100,'Nama produk maksimal harus 100 karakter'),
        deskripsi: Yup.string().max(5000, 'Maksimal 5000 karakter'),
        harga: Yup.number()
<<<<<<< HEAD
=======
        .typeError('Harga harus diisi angka')
>>>>>>> origin/featuretwo
          .positive('Harga harus lebih dari 0')
          .required('Harga wajib diisi'),
        berat: Yup.number().required().positive(),
        sku: Yup.string().required(),
        isActive: Yup.boolean(),
        kategoriId: Yup.string().required('Kategori wajib dipilih'),
    })