import z from 'zod';

export const PostEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  description: z.string().optional().default(''),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Start date must be a valid datetime',
  }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'End date must be a valid datetime',
  }),
});

export type PostEventParams = z.infer<typeof PostEventSchema>;
