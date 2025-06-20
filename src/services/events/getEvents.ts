import { supabase } from '@/lib/supabase';
import { GetEventsParams } from '@/schemas/events/GetEventsSchema';

const getEvents = async ({
  page,
  perPage,
  searchTerm,
  filter,
  sortBy,
  ascending,
}: GetEventsParams) => {
  const from = (page - 1) * perPage;
  const to = page * perPage - 1;

  let query = supabase
    .from('events')
    .select('*', {
      count: 'exact',
    })
    .order(sortBy, { ascending });

  if (searchTerm) {
    query = query.textSearch('search_vector', searchTerm, {
      type: 'websearch',
    });
  }

  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
  const todayEnd = new Date(now.setHours(23, 59, 59, 999)).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  switch (filter) {
    case 'recent':
      query = query
        .lte('end_date', new Date().toISOString())
        .gte('end_date', weekAgo);
      break;

    case 'today':
      query = query.lte('start_date', todayEnd).gte('end_date', todayStart);
      break;

    case 'upcoming':
      query = query.gt('start_date', new Date().toISOString());
      break;

    case 'all':
    default:
      break;
  }

  const { count } = await query;

  if (!count || count === 0 || from >= count) {
    return {
      docs: [],
      total: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage),
    };
  }

  const { data, error } = await query.range(from, to);

  if (error) {
    console.log({
      fn_name: 'getEvents',
      error: error.message,
      args: { page, perPage, searchTerm, filter },
      data: null,
      count: null,
      timestamp: new Date().toISOString(),
    });

    throw new Error('Failed to fetch events');
  }

  return {
    docs: data || [],
    total: count || 0,
    page,
    perPage,
    totalPages: Math.ceil((count || 0) / perPage),
  };
};

export default getEvents;
