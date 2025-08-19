import { supabase } from '@/lib/supabase';
import { PostScoreParams } from '@/schemas/scores/PostScoreSchema';

const setScore = async ({ game, team, value }: PostScoreParams) => {
  const { data, error } = await supabase
    .from('scores')
    .update({ [team]: value, updated_at: new Date().toISOString() })
    .eq('game', game)
    .select()
    .single();

  if (error) {
    console.error({
      fn_name: 'setScore',
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    throw new Error('Failed to set scores');
  }

  return data;
};

export default setScore;
