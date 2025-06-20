import { GetEventsSchema } from '@/schemas/events/GetEventsSchema';
import getEvents from '@/services/events/getEvents';
import { NextRequest, NextResponse } from 'next/server';

const getHandler = async (req: NextRequest) => {
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const validate = GetEventsSchema.safeParse(searchParams);

  if (!validate.success) {
    console.log({
      route: 'api/events',
      method: 'GET',
      error: validate.error.flatten(),
      searchParams,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: validate.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const data = await getEvents(validate.data);

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
      route: 'api/events',
      method: 'GET',
      error: (error as Error).message,
      searchParams,
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

// const putHandler = async (req: NextRequest) => {
//   return NextResponse.json(
//     {
//       data: {},
//     },
//     {
//       status: 201,
//     },
//   );
// };

export {
  getHandler as GET,
  // putHandler as PUT
};
