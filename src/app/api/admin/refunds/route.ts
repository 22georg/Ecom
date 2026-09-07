import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { getAdminRefunds } from '@/services/admin-return-refund.service';

export async function GET() {
  const authCheck = await requireAdminPermission('refunds.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const refunds = await getAdminRefunds();

  return NextResponse.json({
    success: true,
    refunds,
  });
}
