import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import {
  getAdminProductById,
  updateAdminProduct,
  updateAdminProductStatus,
  deleteAdminProduct,
} from '@/services/admin-product.service';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authCheck = await requireAdminPermission('products.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const product = await getAdminProductById(params.id);
  if (!product) {
    return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    product,
  });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const authCheck = await requireAdminPermission('products.update');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const updated = await updateAdminProduct(authCheck.adminUser.id, params.id, body);

    return NextResponse.json({
      success: true,
      product: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Update failed.' }, { status: 400 });
  }
}

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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const authCheck = await requireAdminPermission('products.delete');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    await deleteAdminProduct(authCheck.adminUser.id, params.id);
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Delete failed.' }, { status: 400 });
  }
}
