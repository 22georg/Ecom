import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { getInventoryMovementsHistory } from '@/services/admin-inventory.service';

export async function GET() {
  const authCheck = await requireAdminPermission('inventory.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const movements = await getInventoryMovementsHistory(100);

  return NextResponse.json({
    success: true,
    movements,
  });
}
