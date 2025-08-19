import z from 'zod';

export const PostScoreSchema = z.object({
  game: z.string().min(1, 'Game is required'),
  team: z.enum(['white', 'blue', 'gold']),
  value: z.number().min(0, 'Score must be a positive number'),
});

export type PostScoreParams = z.infer<typeof PostScoreSchema>;
