import { z } from 'zod';

export const StoreUpdateDTO = z.object({
  storeId: z.string().uuid(),
  name: z.string().trim().min(2, {
    message: 'Nama toko minimal terdiri dari 2 karakter.',
  }),
  address: z.string().trim().min(5, {
    message: 'Alamat minimal terdiri dari 5 karakter.',
  }),
  city: z.string().trim().min(2, {
    message: 'Nama kota minimal terdiri dari 2 karakter.',
  }),
  province: z.string().trim().min(2, {
    message: 'Nama provinsi minimal terdiri dari 2 karakter.',
  }),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, {
      message: 'Kode pos harus terdiri dari 5 digit angka.',
    }),
  latitude: z.coerce
    .number()
    .min(-90, {
      message: 'Latitude harus bernilai antara -90 hingga 90.',
    })
    .max(90, {
      message: 'Latitude harus bernilai antara -90 hingga 90.',
    }),
  longitude: z.coerce
    .number()
    .min(-180, {
      message: 'Longitude harus bernilai antara -180 hingga 180.',
    })
    .max(180, {
      message: 'Longitude harus bernilai antara -180 hingga 180.',
    }),
  maxDistance: z.coerce.number().positive({
    message: 'Jarak maksimum harus berupa angka positif.',
  }),
  adminId: z
    .string()
    .trim()
    .uuid({
      message: 'ID admin harus berupa UUID yang valid.',
    })
    .optional()
    .nullable(),
});
