import { supabase } from '@/lib/supabase';
import { PostEventParams } from '@/schemas/events/PostEventSchema';

const patchEvent = async (
  eventId: string,
  eventData: Partial<PostEventParams>,
) => {
  const { data, error } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    console.error({
      fn_name: 'patchEvent',
      error: error.message,
      params: { eventId, eventData },
      timestamp: new Date().toISOString(),
    });

    throw new Error('Failed to update event');
  }

  return data;
};

export default patchEvent;
