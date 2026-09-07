import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { getAdminCategoriesTree } from '@/services/admin-product.service';
import { prisma } from '@/lib/db';
import { logAdminAction } from '@/services/admin-audit.service';

export async function GET() {
  const authCheck = await requireAdminPermission('categories.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const categories = await getAdminCategoriesTree();

  return NextResponse.json({
    success: true,
    categories,
  });
}

export async function POST(request: Request) {
  const authCheck = await requireAdminPermission('categories.manage');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const { name, slug, description, parentId } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: 'Name and slug are required.' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        parentId: parentId || null,
      },
    });

    await logAdminAction({
      adminUserId: authCheck.adminUser.id,
      action: 'CATEGORY_CREATED',
      entityType: 'Category',
      entityId: category.id,
      payload: { name, slug },
    });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to create category.' }, { status: 400 });
  }
}
