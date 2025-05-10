import { currentDate, dateFrom } from '@/helpers/datetime';
import { differenceInYears, isBefore } from 'date-fns';
import { z } from 'zod';

export const UserUpdateBioDTO = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .regex(
      /^[A-Za-z]+(?:[' -][A-Za-z]+)*$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes',
    ),

  dateOfBirth: z
    .preprocess(
      (value) => {
        // If it's a string, try converting it to a Date
        if (typeof value === 'string' || value instanceof Date) {
          const date = dateFrom(value);
          return isNaN(date.getTime()) ? undefined : date;
        }
        return undefined;
      },
      z
        .date()
        .refine((value) => isBefore(value, currentDate()), {
          message: 'Date of birth must be in the past.',
        })
        .refine(
          (value) => {
            const age = differenceInYears(currentDate(), value);
            return age >= 10;
          },
          {
            message: 'You must be at least 10 years old.',
          },
        )
        .refine(
          (value) => {
            const age = differenceInYears(currentDate(), value);
            return age <= 150;
          },
          {
            message: 'Age cannot exceed 150 years.',
          },
        ),
    )
    .optional(),

  gender: z.enum(['MALE', 'FEMALE']).optional(),

  // email: z.string().email('Invalid email format'),

  phone: z
    .string()
    .refine(
      (value) => {
        // Remove spaces, dashes, etc.
        const sanitized = value.replace(/[\s-]/g, '');
        const phoneRX = /^(?:\+62|0)[2-9]{1}[0-9]{7,11}$/;
        return phoneRX.test(sanitized);
      },
      {
        message: 'Phone number must be a valid Indonesian number.',
      },
    )
    .optional(),
});
