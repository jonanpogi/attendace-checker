import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type LoginParams = z.infer<typeof LoginSchema>;
