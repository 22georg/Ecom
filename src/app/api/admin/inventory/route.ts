import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { getAdminInventoryLevels, adjustInventoryStock } from '@/services/admin-inventory.service';

export async function GET(request: Request) {
  const authCheck = await requireAdminPermission('inventory.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;

  const items = await getAdminInventoryLevels(search);

  return NextResponse.json({
    success: true,
    items,
  });
}

export async function POST(request: Request) {
  const authCheck = await requireAdminPermission('inventory.adjust');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const { inventoryItemId, variantId, warehouseId, adjustmentType, deltaQuantity, reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json({ success: false, error: 'Mandatory reason is required for stock adjustment.' }, { status: 400 });
    }

    const updated = await adjustInventoryStock(authCheck.adminUser.id, {
      inventoryItemId,
      variantId,
      warehouseId,
      adjustmentType,
      deltaQuantity: Number(deltaQuantity),
      reason,
    });

    return NextResponse.json({
      success: true,
      item: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Stock adjustment failed.' }, { status: 400 });
  }
}
