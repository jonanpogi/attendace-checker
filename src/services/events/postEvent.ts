import { PostEventParams } from '@/schemas/events/PostEventSchema';
import { supabase } from '@/lib/supabase';

const postEvents = async ({
  name,
  activity,
  description,
  start_date,
  end_date,
}: PostEventParams) => {
  const { data, error } = await supabase
    .from('events')
    .insert([
      {
        name,
        activity,
        description,
        start_date,
        end_date,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error({
      fn_name: 'putEvents',
      error: error.message,
      params: { name, activity, description, start_date, end_date },
      timestamp: new Date().toISOString(),
    });

    throw new Error('Failed to create event');
  }

  return data;
};

export default postEvents;
