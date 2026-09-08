import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { updateAdminCategory, deleteAdminCategory } from '@/services/admin-product.service';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const authCheck = await requireAdminPermission('categories.manage');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const updated = await updateAdminCategory(authCheck.adminUser.id, params.id, body);

    return NextResponse.json({
      success: true,
      category: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Category update failed.' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const authCheck = await requireAdminPermission('categories.manage');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    await deleteAdminCategory(authCheck.adminUser.id, params.id);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Category delete failed.' }, { status: 400 });
  }
}
