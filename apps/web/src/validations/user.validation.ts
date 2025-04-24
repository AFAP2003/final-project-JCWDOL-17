import * as Yup from 'yup';

export interface MyFormValues {
    gambar:       string;
    nama:         string;
    email:        string;
    password:     string;
    alamat:       string;
    toko:         string;
    kode_rujukan: string;
    role:         string;
    verifikasi:   boolean;
  }

 export const validationSchema = Yup.object<MyFormValues>().shape({
    gambar: Yup.mixed(), 
    nama: Yup.string().required('Nama wajib diisi'),
    email: Yup.string()
      .email('Email tidak valid')
      .required('Email wajib diisi'),
    password: Yup.string().required('Password wajib diisi'),
    alamat:Yup.string().optional(),
    toko: Yup.string().required('Role wajib dipilih'), 
    kode_rujukan: Yup.string().optional(),
    role: Yup.string()
      .required('Role wajib dipilih')
      .oneOf(['USER', 'ADMIN', 'SUPER']),
    verifikasi: Yup.boolean(),
  });