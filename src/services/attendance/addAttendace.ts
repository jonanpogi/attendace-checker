import { supabase } from '@/lib/supabase';

type AddAttendanceParams = {
  event_id: string;
  user_afpsn: string;
  context?: object;
};

const addAttendance = async ({
  event_id,
  user_afpsn,
  context = {},
}: AddAttendanceParams) => {
  const { data: existing, error: checkError } = await supabase
    .from('attendance')
    .select('*')
    .eq('event_id', event_id)
    .eq('user_afpsn', user_afpsn)
    .maybeSingle();

  if (checkError) {
    console.error({
      fn_name: 'addAttendance',
      stage: 'check_existing',
      error: checkError.message,
      params: { event_id, user_afpsn },
      timestamp: new Date().toISOString(),
    });
    throw new Error('Error checking existing attendance');
  }

  if (existing) return existing;

  const { data, error } = await supabase
    .from('attendance')
    .insert([{ event_id, user_afpsn, context }])
    .select()
    .single();

  if (error) {
    console.error({
      fn_name: 'addAttendance',
      stage: 'insert',
      error: error.message,
      params: { event_id, user_afpsn, context },
      timestamp: new Date().toISOString(),
    });
    throw new Error('Failed to add attendance');
  }

  return data;
};

export default addAttendance;
