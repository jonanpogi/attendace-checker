import { GetEventsSchema } from '@/schemas/events/GetEventsSchema';
import { PostEventSchema } from '@/schemas/events/PostEventSchema';
import getEvents from '@/services/events/getEvents';
import postEvent from '@/services/events/postEvent';
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

const postHandler = async (req: NextRequest) => {
  const body = await req.json();
  const validate = PostEventSchema.safeParse(body);

  if (!validate.success) {
    console.log({
      route: 'api/events',
      method: 'PUT',
      error: validate.error.flatten(),
      body,
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
    const { id } = await postEvent(validate.data);

    return NextResponse.json(
      {
        data: { id },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error({
      route: 'api/events',
      method: 'PUT',
      error: (error as Error).message,
      body: validate.data,
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

export { getHandler as GET, postHandler as POST };
