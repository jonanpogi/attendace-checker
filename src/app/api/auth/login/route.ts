import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { COOKIE_TOKEN_NAME } from '@/utils/constants';
import { LoginSchema } from '@/schemas/auth/loginSchema';

const encoder = new TextEncoder();

const handler = async (req: NextRequest) => {
  const body = await req.json();
  const validate = LoginSchema.safeParse(body);

  if (!validate.success) {
    console.log({
      route: 'api/auth/login',
      method: 'POST',
      error: validate.error.flatten(),
      body,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: validate.error.flatten() },
      { status: 400 },
    );
  }

  const { username, password } = validate.data;

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 401 });
  }

  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(encoder.encode(process.env.JWT_SECRET!));

  const res = NextResponse.json({ data: { success: true } }, { status: 200 });

  res.cookies.set(COOKIE_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
  });

  return res;
};

export { handler as POST };
