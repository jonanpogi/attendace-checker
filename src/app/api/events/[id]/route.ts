import getEvent from '@/services/events/geEvent';
import { NextRequest, NextResponse } from 'next/server';

const getByIdHandler = async (req: NextRequest) => {
  const pathParams = req.nextUrl.pathname.split('/');
  const eventId = pathParams[pathParams.length - 1];

  try {
    const data = await getEvent(eventId);

    return NextResponse.json(
      {
        data,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error({
      route: `/api/events/${eventId}`,
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

export { getByIdHandler as GET };
