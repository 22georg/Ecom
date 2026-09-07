import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { getAdminDashboardMetrics } from '@/services/admin-dashboard.service';

export async function GET(request: Request) {
  const authCheck = await requireAdminPermission('reports.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const { searchParams } = new URL(request.url);
  const period = (searchParams.get('period') || '30d') as 'today' | '7d' | '30d' | 'month' | 'all';

  const metrics = await getAdminDashboardMetrics({ period });

  return NextResponse.json({
    success: true,
    period,
    metrics,
  });
}
