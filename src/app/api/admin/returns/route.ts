import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { getAdminReturns, updateAdminReturnStatus } from '@/services/admin-return-refund.service';

export async function GET(request: Request) {
  const authCheck = await requireAdminPermission('returns.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;

  const returns = await getAdminReturns(status);

  return NextResponse.json({
    success: true,
    returns,
  });
}

export async function PATCH(request: Request) {
  const authCheck = await requireAdminPermission('returns.manage');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const { returnId, status } = body;

    if (!returnId || !['APPROVED', 'REJECTED', 'RECEIVED', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid return status action.' }, { status: 400 });
    }

    const updated = await updateAdminReturnStatus(authCheck.adminUser.id, returnId, status);

    return NextResponse.json({
      success: true,
      return: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Update failed.' }, { status: 400 });
  }
}
