import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { getAdminDashboardMetrics } from '@/services/admin-dashboard.service';

export async function GET(request: Request) {
  const authCheck = await requireAdminPermission('reports.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const { searchParams } = new URL(request.url);
  const period = (searchParams.get('period') || '30d') as any;

  const metrics = await getAdminDashboardMetrics({ period });

  return NextResponse.json({
    success: true,
    reports: {
      salesOverview: metrics.sales,
      orderStatusDistribution: metrics.orderStatusCounts,
      topPerformingProducts: metrics.topProducts,
      timeSeriesTrend: metrics.timeSeries,
      inventoryHealth: metrics.inventory,
    },
  });
}
