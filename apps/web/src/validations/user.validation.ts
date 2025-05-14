import * as Yup from 'yup';

export interface MyFormValues {
  gambar: string;
  nama: string;
  email: string;
  password: string;
  toko: string;
  role: string;
  
}

export const getValidationSchema = (isEditMode: boolean) =>
  Yup.object<MyFormValues>().shape({
 image: Yup
      .mixed<FileList>()
      .test(
        'required',
        'Foto wajib diupload',
        (value) => !!value && value.length > 0
      )
      .test(
        'fileSize',
        'Ukuran file maksimal 1MB',
        (value) => !value || (value[0]?.size ?? 0) <= 1024 * 1024
      )
      .test(
        'fileType',
        'Format foto tidak valid',
        (value) => !value || ['image/jpeg','image/png','image/gif'].includes(value[0]?.type)
      ),    nama: Yup.string().required('Nama wajib diisi').min(2,'Nama setidaknya harus 2 karakter').max(50,'Nama maksimal harus 50 karakter').trim()  .matches(
      /^[A-Za-z\s]+$/,
      'Nama hanya boleh berisi huruf dan spasi'
    ),
    email: Yup.string()
      .trim()
      .max(50)
      .email('Email tidak valid')
      .required('Email wajib diisi')
      .matches(
        /^[A-Z0-9._%+-]+@admin\.com$/i, 
        'E-mail harus menggunakan domain @admin.com',
      ),
    password: isEditMode
      ? Yup.string().notRequired()
      : Yup.string().required('Password wajib diisi'),
    toko: Yup.string().required('Role wajib dipilih'),
    role: Yup.string()
      .required('Role wajib dipilih')
      .oneOf(['USER', 'ADMIN', 'SUPER']),
  });
