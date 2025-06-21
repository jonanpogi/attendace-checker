import { NextRequest, NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';
import addAttendance from '@/services/attendance/addAttendace';
// import addAttendance from '@/services/attendance/addAttendace';

const SECRET_KEY = process.env.QR_SECRET as string;

const handler = async (req: NextRequest) => {
  const data = await req.json();

  if (!data || !data.encrypted || !data.eventId) {
    return NextResponse.json(
      { error: 'Bad Request' },
      {
        status: 400,
      },
    );
  }

  const { encrypted, eventId } = data;

  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  const parsedDecrypted = JSON.parse(decrypted);

  const result = await addAttendance({
    event_id: eventId,
    user_afpsn: parsedDecrypted.afpsn,
    context: parsedDecrypted,
  });

  return NextResponse.json(
    { data: result },
    {
      status: 201,
    },
  );
};

export { handler as POST };
