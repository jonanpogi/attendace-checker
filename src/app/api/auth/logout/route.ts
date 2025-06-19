import { COOKIE_TOKEN_NAME } from '@/utils/constants';
import { NextResponse } from 'next/server';

const handler = () => {
  try {
    const response = NextResponse.json(
      {
        message: 'Logout successful',
      },
      { status: 200 },
    );

    response.cookies.set(COOKIE_TOKEN_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error({
      route: 'api/auth/logout',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
};

export { handler as GET };
