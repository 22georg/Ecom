import { NextResponse } from 'next/server';
import { revokeCurrentAdminSession } from '@/lib/admin-auth';

export async function POST() {
  await revokeCurrentAdminSession();
  return NextResponse.json({ success: true, message: 'Admin session terminated.' });
}
