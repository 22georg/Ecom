import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authCheck = await requireAdminPermission('customers.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        addresses: true,
        orders: { orderBy: { createdAt: 'desc' }, take: 10 },
        returns: { orderBy: { createdAt: 'desc' }, take: 10 },
        reviews: { include: { product: true }, orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        name: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone,
        status: customer.status,
        isActive: customer.isActive,
        isVerified: customer.isVerified,
        createdAt: customer.createdAt,
        addresses: customer.addresses,
        orders: customer.orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          grandTotal: Number(o.grandTotal),
          createdAt: o.createdAt,
        })),
        returns: customer.returns.map((r) => ({
          id: r.id,
          orderId: r.orderId,
          reason: r.reason,
          status: r.status,
          createdAt: r.createdAt,
        })),
        reviews: customer.reviews.map((rev) => ({
          id: rev.id,
          productName: rev.product.name,
          rating: rev.rating,
          comment: rev.comment,
          isApproved: rev.isApproved,
          createdAt: rev.createdAt,
        })),
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch customer profile.' }, { status: 500 });
  }
}
