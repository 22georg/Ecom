import { NextResponse } from 'next/server';
import { getCurrentAdminUser } from '@/lib/admin-auth';

export async function GET() {
  const adminUser = await getCurrentAdminUser();
  if (!adminUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: adminUser,
  });
}
