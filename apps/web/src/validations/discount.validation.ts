import * as Yup from 'yup';

export const getValidationSchema = ()=>
    Yup.object().shape({
          nama: Yup.string().required('Nama wajib diisi').max(50,'Nama maksimal harus 50 karakter').min(2,'Nama setidaknya harus 2 karakter').trim(),
          deskripsi:Yup.string().required('Deskripsi wajib diisi').max(500,'Maksimal 500 karakter'),
          tipe_diskon: Yup.string().required('Tipe Diskon wajib dipilih').oneOf(['diskon_normal', 'diskon_syarat', 'bogo']),
          tipe_nilai_diskon:Yup.string().optional().oneOf(['percentage','nominal']),
          nilai_diskon: Yup.number()
            .typeError('Masukkan angka')
            .positive()
            .optional()
            .min(1),
          min_pembelian: Yup.number().typeError('Masukkan angka').min(0).nullable(),
          potongan_maks: Yup.number().typeError('Masukkan angka').min(0).nullable(),
          // kode_voucher: Yup.string().nullable(),
          // batas_penggunaan: Yup.number()
          //   .typeError('Masukkan angka')
          //   .min(0)
          //   .nullable(),
          tanggal_mulai: Yup.date().required('Tanggal mulai wajib diisi'),
          kadaluwarsa:Yup.date().required('Tanggal kadaluwarsa wajib diisi')
        })
