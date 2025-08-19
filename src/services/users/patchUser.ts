import { supabase } from '@/lib/supabase';
import { PostUserParams } from '@/schemas/users/PostUserSchema';

const patchUser = async (id: string, params: Partial<PostUserParams>) => {
  const { data, error } = await supabase
    .from('users')
    .update(params)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error({
      fn_name: 'patchUser',
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    throw new Error('Failed to update user');
  }

  return data;
};

export default patchUser;
