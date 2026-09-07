import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { getAdminProducts, createAdminProduct } from '@/services/admin-product.service';

export async function GET(request: Request) {
  const authCheck = await requireAdminPermission('products.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;
  const status = (searchParams.get('status') || undefined) as any;
  const categoryId = searchParams.get('categoryId') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const result = await getAdminProducts({ search, status, categoryId, page, limit });

  return NextResponse.json({
    success: true,
    ...result,
  });
}

export async function POST(request: Request) {
  const authCheck = await requireAdminPermission('products.create');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const product = await createAdminProduct(authCheck.adminUser.id, body);

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to create product.' }, { status: 400 });
  }
}
