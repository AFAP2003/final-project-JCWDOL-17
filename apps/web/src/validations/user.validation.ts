import * as Yup from 'yup';

export interface MyFormValues {
  gambar: FileList | null;
  nama: string;
  email: string;
  password: string;
  toko: string;
  role: string;
  
}

export const getValidationSchema = (isEditMode: boolean) =>
  Yup.object<MyFormValues>().shape({
 image: isEditMode
  ? Yup.mixed().notRequired() // <- allow skipping image during edit
  : Yup
      .mixed<FileList>()
      .required('Foto wajib diupload'),
      // .test('fileSize', 'Ukuran file maksimal 1MB', value => !value || (value[0]?.size ?? 0) <= 1024 * 1024)
      // .test('fileType', 'Format foto tidak valid', value => !value || ['image/jpeg','image/png','image/gif'].includes(value[0]?.type)),
    nama:Yup.string().required('Nama wajib diisi'),
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
