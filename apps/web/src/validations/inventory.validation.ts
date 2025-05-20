// In your inventory.validation.ts or wherever getValidationSchema is

import * as Yup from 'yup';

export const getValidationSchema = () =>
    Yup.object().shape({
        produk: Yup.string().optional(),
        // Conditionally require toko only if the user role is SUPER_ADMIN
        // You handle user role outside the schema, so requiring it here is fine
        // as long as the hook ensures it's filled for ADMIN before validation.
        toko: Yup.string().optional(),
        mode: Yup.string().oneOf(['tambah', 'kurangi']).optional(),

        // Validate tambah as a number
        tambah: Yup.number()
          .typeError('Jumlah tambah stok harus angka') // Message for non-numeric input
          .when('mode', {
            is: 'tambah',
            then: (schema) => schema
              .optional() // Requires a number (0 is a valid number)
              .min(1, 'Jumlah tambah stok minimal 1') // Requires a minimum of 1 to add
              .integer('Jumlah tambah stok harus bilangan bulat') // Assuming quantity is in whole units
              .nullable(false), // Requires a value when mode is 'tambah'
            otherwise: (schema) => schema.notRequired().nullable(true), // Allow null or undefined when not in 'tambah' mode
          }),

        // Validate kurangi as a number
        kurangi: Yup.number()
           .typeError('Jumlah kurangi stok harus angka') // Message for non-numeric input
          .when('mode', {
            is: 'kurangi',
            then: (schema) => schema
              .optional() // Requires a number
              .min(1, 'Jumlah kurangi stok minimal 1') // Requires a minimum of 1 to subtract
               .integer('Jumlah kurangi stok harus bilangan bulat') // Assuming quantity is in whole units
              .nullable(false), // Requires a value when mode is 'kurangi'
            otherwise: (schema) => schema.notRequired().nullable(true), // Allow null or undefined when not in 'kurangi' mode
          }),

        minimal: Yup.number()
          .typeError('Minimal stok harus angka') // Message for non-numeric input
          .min(0, 'Minimal stok tidak boleh negatif')
          .optional() // This was already correct
          .integer('Minimal stok harus bilangan bulat'), // Assuming minimal stock is in whole units
      });