import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { getAdminOrders } from '@/services/admin-order.service';

export async function GET(request: Request) {
  const authCheck = await requireAdminPermission('orders.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;
  const status = (searchParams.get('status') || undefined) as any;
  const paymentStatus = (searchParams.get('paymentStatus') || undefined) as any;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const result = await getAdminOrders({ search, status, paymentStatus, page, limit });

  return NextResponse.json({
    success: true,
    ...result,
  });
}
