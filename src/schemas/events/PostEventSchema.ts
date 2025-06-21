import z from 'zod';

export const PostEventSchema = z
  .object({
    name: z.string().min(1, 'Event name is required'),
    activity: z.string().min(1, 'Activity is required'),
    description: z.string().optional().default(''),
    start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Start date must be a valid datetime',
    }),
    end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'End date must be a valid datetime',
    }),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      return end > start;
    },
    {
      message: 'End date must be after start date',
      path: ['end_date'],
    },
  )
  .refine(
    (data) => {
      const now = new Date();
      const start = new Date(data.start_date);
      return start >= now;
    },
    {
      message: 'Start date must not be in the past',
      path: ['start_date'],
    },
  );

export type PostEventParams = z.infer<typeof PostEventSchema>;
