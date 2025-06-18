import { NextRequest, NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.QR_SECRET as string;

const handler = async (req: NextRequest) => {
  const data = await req.json();

  if (!data) {
    return NextResponse.json(
      { error: 'Bad Request' },
      {
        status: 400,
      },
    );
  }

  const { encrypted } = data;

  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);

  // Persist to DB

  return NextResponse.json(
    { decrypted: JSON.parse(decrypted) },
    {
      status: 200,
    },
  );
};

export { handler as POST };
