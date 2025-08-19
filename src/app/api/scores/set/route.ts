import { PostScoreSchema } from '@/schemas/scores/PostScoreSchema';
import setScore from '@/services/scores/setScore';
import { NextRequest, NextResponse } from 'next/server';

const postHandler = async (req: NextRequest) => {
  const body = await req.json();
  const validate = PostScoreSchema.safeParse(body);

  if (!validate.success) {
    console.log({
      route: 'api/scores/set',
      method: 'POST',
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
    const { id } = await setScore(validate.data);

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
      route: 'api/scores/set',
      method: 'POST',
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

export { postHandler as POST };
