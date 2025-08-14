import getScores from '@/services/scores/getScores';
import { NextResponse, NextRequest } from 'next/server';

type ResponseType = Array<{
  id: string;
  game: string;
  white: number;
  blue: number;
  gold: number;
  created_at: string;
  updated_at: string;
}>;

const getHandler = async (req: NextRequest) => {
  try {
    const data = (await getScores()) as ResponseType;

    const shaped: Record<
      string,
      { white: number; blue: number; gold: number }
    > = {};
    let lastUpdated = 0;

    for (const r of data ?? []) {
      shaped[r.game] = { white: r.white, blue: r.blue, gold: r.gold };
      const ts = new Date(r.updated_at).getTime();
      if (ts > lastUpdated) lastUpdated = ts;
    }

    const etag = `"${lastUpdated}"`;
    const ifNoneMatch = req.headers.get('if-none-match');

    if (ifNoneMatch && ifNoneMatch === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          'Cache-Control': 'no-store',
          ETag: etag,
        },
      });
    }

    return NextResponse.json(
      {
        data: { scores: shaped, last_updated: lastUpdated },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          ETag: etag,
        },
      },
    );
  } catch (error) {
    console.error({
      route: 'api/scores',
      method: 'GET',
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      {
        status: 500,
      },
    );
  }
};

export { getHandler as GET };
