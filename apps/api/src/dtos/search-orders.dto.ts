import { z } from 'zod';

export const SearchOrdersDTO = z.object({
  query: z.string().optional(),
  status: z.string().optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
