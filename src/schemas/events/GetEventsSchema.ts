import { z } from 'zod';

export const GetEventsSchema = z.object({
  page: z.string().transform(Number).default('1'),
  perPage: z.string().transform(Number).default('10'),
  searchTerm: z.string().optional().default(''),
  filter: z.enum(['all', 'recent', 'today', 'upcoming']).default('all'),
  sortBy: z.string().optional().default('created_at'),
  ascending: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional()
    .default('true'),
});

export type GetEventsParams = z.infer<typeof GetEventsSchema>;
