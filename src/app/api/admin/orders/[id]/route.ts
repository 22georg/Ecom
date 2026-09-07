import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { getAdminOrderDetail, updateAdminOrderStatus, createAdminOrderShipment } from '@/services/admin-order.service';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authCheck = await requireAdminPermission('orders.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const order = await getAdminOrderDetail(params.id);
  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    order,
  });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const authCheck = await requireAdminPermission('orders.manage');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const body = await request.json();

    // 1. Status Update Action
    if (body.action === 'UPDATE_STATUS') {
      const { status } = body;
      if (!['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
        return NextResponse.json({ success: false, error: 'Invalid order status.' }, { status: 400 });
      }

      const updated = await updateAdminOrderStatus(authCheck.adminUser.id, params.id, status);
      return NextResponse.json({ success: true, order: updated });
    }

    // 2. Create Shipment Action
    if (body.action === 'CREATE_SHIPMENT') {
      const { carrier, trackingNumber } = body;
      if (!carrier || !trackingNumber) {
        return NextResponse.json({ success: false, error: 'Carrier and tracking number are required.' }, { status: 400 });
      }

      const shipment = await createAdminOrderShipment(authCheck.adminUser.id, {
        orderId: params.id,
        carrier,
        trackingNumber,
      });

      return NextResponse.json({ success: true, shipment });
    }

    return NextResponse.json({ success: false, error: 'Invalid order management action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Operation failed.' }, { status: 400 });
  }
}
