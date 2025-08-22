import getAttendanceUsers from '@/services/attendance/getAttendanceUsers';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

const handler = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('event_id');

  if (!eventId) {
    return NextResponse.json({ error: 'Missing event_id' }, { status: 400 });
  }

  const data = await getAttendanceUsers(eventId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = data.map((row: any) => ({
    Rank: row.rank,
    'Full Name': row.full_name,
    AFPSN: row.afpsn,
    BOS: row.bos,
    'Created At': row.created_at,
    'Updated At': row.updated_at,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="attendance_${eventId}.xlsx"`,
    },
  });
};

export { handler as GET };
