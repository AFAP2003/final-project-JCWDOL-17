import { z } from 'zod';

export const AddressCreateDTO = z.object({
  label: z.string().trim().min(4, 'Required, min of 4 character long').max(50),

  address: z
    .string()
    .trim()
    .min(10, 'Required, min of 10 character long')
    .max(200),

  province: z
    .string()
    .trim()
    .min(4, 'Required, min of 5 character long')
    .max(30),

  city: z.string().trim().min(4, 'Required, min of 4 character long').max(30),

  postalCode: z.string().regex(/^\d{5}$/, {
    message: 'Required and must be 5 digit number',
  }),

  isPrimary: z.boolean(),

  latitude: z
    .number()
    .min(-90, { message: 'Latitude must be >= -90' })
    .max(90, { message: 'Latitude must be <= 90' }),

  longitude: z
    .number()
    .min(-180, { message: 'Longitude must be >= -180' })
    .max(180, { message: 'Longitude must be <= 180' }),

  recipient: z
    .string()
    .trim()
    .min(3, 'Required, min of 3 character long')
    .max(30),

  phone: z
    .string()
    .trim()
    .regex(/^(?:\+62|62|0)8[1-9][0-9]{6,10}$/, {
      message: 'Invalid phone number',
    }),
});
