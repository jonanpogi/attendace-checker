import resetScores from '@/services/scores/resetScores';
import { NextResponse } from 'next/server';

const putHandler = async () => {
  try {
    const data = await resetScores();

    return NextResponse.json(
      {
        data: { ids: data.map((item) => item.id) },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error({
      route: 'api/scores/reset',
      method: 'PUT',
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

export { putHandler as PUT };
