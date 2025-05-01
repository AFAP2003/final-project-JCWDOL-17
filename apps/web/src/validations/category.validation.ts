import * as Yup from 'yup';


export const getValidationSchema = () =>
  Yup.object().shape({
    nama: Yup.string().trim().required('Nama wajib diisi').max(50,'Nama maksimal harus 50 karakter').min(2,'Nama setidaknya harus 2 karakter')  .matches(
        /^[A-Za-z\s]+$/,
        'Nama hanya boleh berisi huruf dan spasi'
      ),
    deskripsi: Yup.string().max(250, 'Maksimal 250 karakter').required('Deskripsi wajib diisi').trim(),
  });
