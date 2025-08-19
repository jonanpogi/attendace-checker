import z from 'zod';

export const PostUserSchema = z.object({
  rank: z.string().min(1, 'Rank is required'),
  full_name: z.string().min(2, 'Full Name is required'),
  afpsn: z.string().min(1, 'AFPSN is required'),
  bos: z.string().min(1, 'BOS is required'),
  // face_map: z.array(z.number()).min(1, 'Face map is required'),
  face_map: z.array(z.number()).optional(),
});

export type PostUserParams = z.infer<typeof PostUserSchema>;
