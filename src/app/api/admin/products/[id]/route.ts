import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { updateAdminProductStatus } from '@/services/admin-product.service';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const authCheck = await requireAdminPermission('products.update');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const { status } = body;

    if (!status || !['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid product status.' }, { status: 400 });
    }

    const updated = await updateAdminProductStatus(authCheck.adminUser.id, params.id, status);

    return NextResponse.json({
      success: true,
      product: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Update failed.' }, { status: 400 });
  }
}
