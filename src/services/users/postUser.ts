import { supabase } from '@/lib/supabase';
import { PostUserParams } from '@/schemas/users/PostUserSchema';

const postUser = async (params: PostUserParams) => {
  const { data, error } = await supabase
    .from('users')
    .insert(params)
    .select()
    .single();

  if (error) {
    console.error({
      fn_name: 'postUser',
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    throw new Error('Failed to create user');
  }

  return data;
};

export default postUser;
