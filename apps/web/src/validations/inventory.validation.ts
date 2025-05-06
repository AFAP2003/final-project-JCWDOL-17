import * as Yup from 'yup';

export const getValidationSchema =()=>
    Yup.object().shape({
        produk: Yup.string().required('Produk wajib dipilih'),
        toko: Yup.string().required('Toko wajib dipilih'),
        mode: Yup.string().oneOf(['tambah', 'kurangi']).required('Mode harus dipilih'),
        // Conditionally validate tambah or kurangi based on the mode
        tambah: Yup.string().when('mode', {
          is: 'tambah',
          then: (schema) => schema
            .required('Jumlah tambah stok harus diisi')
            .test('positive', 'Jumlah tambah stok harus positif', 
              (value) => !value || Number(value) > 0),
          otherwise: (schema) => schema.notRequired(),
        }),
        kurangi: Yup.string().when('mode', {
          is: 'kurangi',
          then: (schema) => schema
            .required('Jumlah kurangi stok harus diisi')
            .test('positive', 'Jumlah kurangi stok harus positif', 
              (value) => !value || Number(value) > 0),
          otherwise: (schema) => schema.notRequired(),
        }),
          minimal: Yup.number()
          .min(0, 'Tidak boleh negatif')
          .required('Wajib diisi'),
      })