import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const authCheck = await requireAdminPermission('reports.export');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'orders';

  if (!process.env.DATABASE_URL) {
    return new NextResponse('No database connection available', { status: 503 });
  }

  let csvContent = '';
  let filename = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;

  if (type === 'orders') {
    const orders = await prisma.order.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['Order Number', 'Customer Email', 'Status', 'Payment Status', 'Subtotal', 'Grand Total', 'Created At'];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.customer?.email || o.guestEmail || '',
      o.status,
      o.paymentStatus,
      o.subtotal.toString(),
      o.grandTotal.toString(),
      o.createdAt.toISOString(),
    ]);

    csvContent = [headers.join(','), ...rows.map((r: string[]) => r.map((cell: string) => `"${cell}"`).join(','))].join('\n');
  } else if (type === 'products') {
    const products = await prisma.product.findMany({
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['Product Name', 'Slug', 'Status', 'Rating Avg', 'Review Count', 'Variants Count', 'Created At'];
    const rows = products.map((p) => [
      p.name,
      p.slug,
      p.status,
      p.ratingAvg.toString(),
      p.reviewCount.toString(),
      p.variants.length.toString(),
      p.createdAt.toISOString(),
    ]);

    csvContent = [headers.join(','), ...rows.map((r: string[]) => r.map((cell: string) => `"${cell}"`).join(','))].join('\n');
  } else if (type === 'inventory') {
    const items = await prisma.inventoryItem.findMany({
      include: { variant: { include: { product: true } }, warehouse: true },
      orderBy: { updatedAt: 'desc' },
    });

    const headers = ['SKU', 'Product Name', 'Warehouse', 'Quantity On Hand', 'Quantity Reserved', 'Reorder Threshold'];
    const rows = items.map((i) => [
      i.variant.sku,
      i.variant.product.name,
      i.warehouse.code,
      i.quantityOnHand.toString(),
      i.quantityReserved.toString(),
      i.reorderThreshold.toString(),
    ]);

    csvContent = [headers.join(','), ...rows.map((r: string[]) => r.map((cell: string) => `"${cell}"`).join(','))].join('\n');
  } else if (type === 'customers') {
    const customers = await prisma.customer.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['Email', 'First Name', 'Last Name', 'Phone', 'Status', 'Created At'];
    const rows = customers.map((c) => [
      c.email,
      c.firstName,
      c.lastName,
      c.phone || '',
      c.status,
      c.createdAt.toISOString(),
    ]);

    csvContent = [headers.join(','), ...rows.map((r: string[]) => r.map((cell: string) => `"${cell}"`).join(','))].join('\n');
  }

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
