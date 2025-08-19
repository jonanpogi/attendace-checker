import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { COOKIE_TOKEN_NAME } from './utils/constants';

const JWT_SECRET = process.env.JWT_SECRET!;

const PUBLIC_GET = ['/api/scores'];
const PUBLIC_POST = [
  '/api/encrypt',
  '/api/auth/login',
  '/api/scores',
  '/api/users',
];
const PUBLIC_PATCH = ['/api/users'];
const PUBLIC_PUT = ['/api/scores'];
const PUBLIC_DELETE = [''];

export const config = {
  matcher: ['/api/:path*'],
};

export const middleware = async (req: NextRequest) => {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const res = NextResponse.next();
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );

  if (
    (req.method === 'GET' && PUBLIC_GET.includes(req.nextUrl.pathname)) ||
    (req.method === 'POST' && PUBLIC_POST.includes(req.nextUrl.pathname)) ||
    (req.method === 'PATCH' && PUBLIC_PATCH.includes(req.nextUrl.pathname)) ||
    (req.method === 'PUT' && PUBLIC_PUT.includes(req.nextUrl.pathname)) ||
    (req.method === 'DELETE' && PUBLIC_DELETE.includes(req.nextUrl.pathname))
  ) {
    return res;
  }

  const token = req.cookies.get(COOKIE_TOKEN_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 401 });
  }

  try {
    const valid = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));

    if (!valid) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 401 });
    }

    res.headers.set('x-authenticated', 'true');
    return res;
  } catch {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 401 });
  }
};
