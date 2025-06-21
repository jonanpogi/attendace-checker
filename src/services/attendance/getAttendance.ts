import { supabase } from '@/lib/supabase';

const getAttendance = async (id: string) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('event_id', id);

  if (error) {
    console.log({
      fn_name: 'getAttendance',
      error: error.message,
      event_id: id,
      timestamp: new Date().toISOString(),
    });
  }

  return data || [];
};

export default getAttendance;
