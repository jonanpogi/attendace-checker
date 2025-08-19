import { supabase } from '@/lib/supabase';

const getEvent = async (id: string) => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.log({
      fn_name: 'getEvents',
      error: error.message,
      args: { id },
      data: null,
      timestamp: new Date().toISOString(),
    });
  }

  return data || null;
};

export default getEvent;
