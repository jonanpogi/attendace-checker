import { NextRequest, NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.QR_SECRET as string;

const handler = async (req: NextRequest) => {
  const data = req.body;

  if (!data) {
    return NextResponse.json(
      { error: 'Bad Request' },
      {
        status: 400,
      },
    );
  }

  const ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    SECRET_KEY,
  ).toString();

  return NextResponse.json(
    { encrypted: ciphertext },
    {
      status: 200,
    },
  );
};

export { handler as POST };
