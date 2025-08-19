import { supabase } from '@/lib/supabase';

type FaceMatch = {
  id: string;
  full_name: string;
  qr_val: string | null;
  distance: number;
  match_rank: number;
};

const findUserByFaceMap = async (faceMap: number[]) => {
  const { data, error } = await supabase.rpc('find_user_by_face_map', {
    query_embedding: faceMap,
    match_threshold: 0.6, // minimum similarity score to consider a match
    margin: 0.1, // keep your server defaults if you like
    min_candidates: 2, // minimum number of candidates to consider
    max_results: 1, // ask for just one row…
    ef: 120, // size of the dynamic list
  });

  if (error) {
    console.error({
      fn_name: 'findUserByFaceMap',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    throw new Error('Failed to find user');
  }

  const rows = (data ?? []) as FaceMatch[];
  return rows[0] ?? null;
};

export default findUserByFaceMap;
