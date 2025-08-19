import { NextRequest, NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';
import addAttendance from '@/services/attendance/addAttendace';

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

  if (!parsedDecrypted || !parsedDecrypted.id) {
    console.log({
      route: 'api/decrypt',
      method: 'POST',
      error: 'Invalid QR code data',
      decrypted,
      timestamp: new Date().toISOString(),
      params: { encrypted, eventId },
    });
    return NextResponse.json(
      { error: 'Invalid QR code data' },
      {
        status: 400,
      },
    );
  }

  try {
    const result = await addAttendance({
      event_id: eventId,
      user_id: parsedDecrypted.id,
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
      params: { encrypted, eventId },
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
