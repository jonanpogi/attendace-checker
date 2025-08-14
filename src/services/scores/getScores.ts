import { supabase } from '@/lib/supabase';

const getScores = async () => {
  const { data, error } = await supabase.from('scores').select('*');

  if (error) {
    console.error({
      fn_name: 'getScores',
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    throw new Error('Failed to fetch scores');
  }

  return data;
};

export default getScores;
