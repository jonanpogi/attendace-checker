import { NextRequest, NextResponse } from 'next/server';
import addAttendance from '@/services/attendance/addAttendace';
import findUserByFaceMap from '@/services/users/findUserByFaceMap';

const handler = async (req: NextRequest) => {
  const data = await req.json();

  if (!data || !data.face_map || !data.eventId) {
    return NextResponse.json(
      { error: 'Bad Request' },
      {
        status: 400,
      },
    );
  }

  const { face_map, eventId } = data;

  const user = (await findUserByFaceMap(face_map)) as { id: string } | null;

  if (!user) {
    return NextResponse.json(
      { data: null },
      {
        status: 200,
      },
    );
  }

  try {
    const result = await addAttendance({
      event_id: eventId,
      user_id: user.id,
    });

    return NextResponse.json(
      { data: result },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error({
      route: 'api/decrypt',
      method: 'POST',
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
      params: { face_map, eventId },
    });

    return NextResponse.json(
      { error: 'Failed to process attendance' },
      {
        status: 500,
      },
    );
  }
};

export { handler as POST };
