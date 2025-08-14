import { NextResponse } from 'next/server';

const handler = () => {
  return NextResponse.json({ ok: true }, { status: 200 });
};

export { handler as GET };
