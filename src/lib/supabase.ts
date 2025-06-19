import { createClient } from '@supabase/supabase-js';

const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createClient> | undefined;
};

export const supabase =
  globalForSupabase.supabase ??
  createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

if (process.env.NODE_ENV !== 'production')
  globalForSupabase.supabase = supabase;
