import { supabase } from '@/lib/supabase';

const resetScores = async () => {
  const { data, error } = await supabase
    .from('scores')
    .update({ white: 0, blue: 0, gold: 0, updated_at: new Date() })
    .neq('game', '')
    .select();

  if (error) {
    console.error({
      fn_name: 'resetScores',
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    throw new Error('Failed to reset scores');
  }

  return data;
};

export default resetScores;
