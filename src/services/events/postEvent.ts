import { PostEventParams } from '@/schemas/events/PostEventSchema';
import { supabase } from '@/lib/supabase';

const postEvents = async (eventData: PostEventParams) => {
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single();

  if (error) {
    console.error({
      fn_name: 'putEvents',
      error: error.message,
      params: eventData,
      timestamp: new Date().toISOString(),
    });

    throw new Error('Failed to create event');
  }

  return data;
};

export default postEvents;
