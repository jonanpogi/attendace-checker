import { PostUserParams, PostUserSchema } from '@/schemas/users/PostUserSchema';
import findUserByFaceMap from '@/services/users/findUserByFaceMap';
import patchUser from '@/services/users/patchUser';
import postUser from '@/services/users/postUser';
import { NextRequest, NextResponse } from 'next/server';

const postHandler = async (req: NextRequest) => {
  const body = await req.json();
  const validate = PostUserSchema.safeParse(body);

  if (!validate.success) {
    console.log({
      route: 'api/users',
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
    const faceMap = validate.data.face_map;
    const user = (await findUserByFaceMap(faceMap)) as {
      id: string;
      qr_val: string;
    };

    if (user) {
      return NextResponse.json(
        {
          data: { id: user.id, qr_val: user.qr_val },
        },
        {
          status: 201,
        },
      );
    }

    const { id } = await postUser(validate.data);

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
      route: 'api/users',
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

const patchHandler = async (req: NextRequest) => {
  const body = (await req.json()) as Partial<PostUserParams> & { id: string };

  try {
    const { id } = await patchUser(body.id, body);

    return NextResponse.json(
      {
        data: { id },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error({
      route: 'api/users',
      method: 'PATCH',
      error: (error as Error).message,
      body,
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

export { postHandler as POST, patchHandler as PATCH };
