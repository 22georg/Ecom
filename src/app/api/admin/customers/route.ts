import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const authCheck = await requireAdminPermission('customers.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: true, customers: [] });
  }

  try {
    const where: any = { deletedAt: null };
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: { select: { orders: true, returns: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      customers: customers.map((c) => ({
        id: c.id,
        email: c.email,
        name: `${c.firstName} ${c.lastName}`,
        phone: c.phone,
        status: c.status,
        isActive: c.isActive,
        isVerified: c.isVerified,
        ordersCount: c._count.orders,
        returnsCount: c._count.returns,
        reviewsCount: c._count.reviews,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch customer directory.' }, { status: 500 });
  }
}
