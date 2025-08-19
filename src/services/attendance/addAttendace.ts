import { supabase } from '@/lib/supabase';

type AddAttendanceParams = {
  event_id: string;
  user_id: string;
};

const addAttendance = async ({ event_id, user_id }: AddAttendanceParams) => {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user_id)
    .maybeSingle();

  if (userError) {
    console.error({
      fn_name: 'addAttendance',
      stage: 'fetch_user',
      error: userError.message,
      params: { user_id },
      timestamp: new Date().toISOString(),
    });
    throw new Error('Failed to fetch user');
  }

  if (!user) {
    console.error({
      fn_name: 'addAttendance',
      stage: 'fetch_user',
      error: 'User not found',
      params: { user_id },
      timestamp: new Date().toISOString(),
    });

    throw new Error('User not found');
  }

  const { data: attendance, error: attendanceError } = await supabase
    .from('attendance')
    .select('*')
    .eq('event_id', event_id)
    .eq('user_id', user_id)
    .maybeSingle();

  if (attendanceError) {
    console.error({
      fn_name: 'addAttendance',
      stage: 'check_existing',
      error: attendanceError,
      params: { event_id, user_id },
      timestamp: new Date().toISOString(),
    });
    throw new Error('Error checking existing attendance');
  }

  if (attendance) return user;

  const { error: insertError } = await supabase
    .from('attendance')
    .insert([{ event_id, user_id }])
    .select()
    .single();

  if (insertError) {
    console.error({
      fn_name: 'addAttendance',
      stage: 'insert',
      error: insertError.message,
      params: { event_id, user_id },
      timestamp: new Date().toISOString(),
    });
    throw new Error('Failed to add attendance');
  }

  return user;
};

export default addAttendance;
