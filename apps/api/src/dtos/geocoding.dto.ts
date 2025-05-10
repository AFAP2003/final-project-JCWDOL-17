import { z } from 'zod';

export const GeocodingDTO = z
  .object({
    name: z.string().trim().optional(),
    resultSize: z
      .string()
      .default('5')
      .refine((val) => !isNaN(Number(val)), {
        message: 'resultSize must be a valid number',
      })
      .transform((val) => Number(val))
      .pipe(z.number().min(1, { message: 'resultSize must be at least 1' })),

    lat: z
      .union([z.string(), z.number()])
      .optional()
      .refine((val) => val === undefined || !isNaN(Number(val)), {
        message: 'lat must be a valid number',
      })
      .transform((val) => (val === undefined ? undefined : Number(val))),

    lng: z
      .union([z.string(), z.number()])
      .optional()
      .refine((val) => val === undefined || !isNaN(Number(val)), {
        message: 'lng must be a valid number',
      })
      .transform((val) => (val === undefined ? undefined : Number(val))),
  })
  .refine(
    (data) =>
      (data.lat === undefined && data.lng === undefined) || // dua-duanya tidak ada → OK
      (data.lat !== undefined && data.lng !== undefined), // dua-duanya ada → OK
    {
      message: 'Both lat and lng must be provided together',
      path: ['lat'],
    },
  );
