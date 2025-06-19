import { NextRequest, NextResponse } from 'next/server';

const handler = (req: NextRequest) => {
  const status =
    req.headers.get('x-authenticated') === 'true'
      ? 'authenticated'
      : 'unauthenticated';

  return NextResponse.json({ data: { status } }, { status: 200 });
};

export { handler as GET };
