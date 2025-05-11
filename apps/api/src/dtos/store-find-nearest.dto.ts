import { z } from 'zod';

export const StoreFindNearestDTO = z.object({
  latitude: z.coerce
    .number()
    .min(-90, { message: 'Latitude must be >= -90' })
    .max(90, { message: 'Latitude must be <= 90' }),

  longitude: z.coerce
    .number()
    .min(-180, { message: 'Longitude must be >= -180' })
    .max(180, { message: 'Longitude must be <= 180' }),
});
