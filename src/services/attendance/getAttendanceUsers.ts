import { supabase } from '@/lib/supabase';

const getAttendanceUsers = async (id: string) => {
  const { data, error } = await supabase
    .from('view_attendance_users')
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

export default getAttendanceUsers;
