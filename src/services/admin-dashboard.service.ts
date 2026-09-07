import { prisma } from '@/lib/db';

export interface DashboardFilterOptions {
  period?: 'today' | '7d' | '30d' | 'month' | 'all';
}

export interface DashboardMetrics {
  sales: {
    grossSales: number;
    netSales: number;
    orderCount: number;
    averageOrderValue: number;
    refundedAmount: number;
    discountTotal: number;
  };
  orderStatusCounts: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  customers: {
    totalCustomers: number;
    newCustomersPeriod: number;
  };
  inventory: {
    totalItems: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  operations: {
    pendingReturnsCount: number;
    pendingReviewsCount: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    status: string;
    paymentStatus: string;
    grandTotal: number;
    createdAt: Date;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    sku: string;
    totalQuantitySold: number;
    totalRevenue: number;
  }>;
  timeSeries: Array<{
    date: string;
    grossSales: number;
    ordersCount: number;
  }>;
}

export async function getAdminDashboardMetrics(
  options: DashboardFilterOptions = {}
): Promise<DashboardMetrics> {
  const period = options.period || '30d';
  const now = new Date();
  let startDate: Date | undefined;

  if (period === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === '7d') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === '30d') {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  if (!process.env.DATABASE_URL) {
    return getFallbackDashboardMetrics();
  }

  try {
    const whereDateClause = startDate ? { createdAt: { gte: startDate } } : {};

    // 1. Fetch Orders in Period
    const orders = await prisma.order.findMany({
      where: whereDateClause,
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });

    const activeOrders = orders.filter((o) => o.status !== 'CANCELLED');
    const grossSales = activeOrders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
    const discountTotal = activeOrders.reduce((sum, o) => sum + Number(o.discountTotal), 0);
    const orderCount = activeOrders.length;
    const averageOrderValue = orderCount > 0 ? grossSales / orderCount : 0;

    // 2. Fetch Refunds in Period
    const refunds = await prisma.refund.findMany({
      where: {
        status: 'COMPLETED',
        ...(startDate ? { createdAt: { gte: startDate } } : {}),
      },
    });
    const refundedAmount = refunds.reduce((sum, r) => sum + Number(r.amount), 0);
    const netSales = Math.max(0, grossSales - refundedAmount);

    // 3. Order Status Breakdown
    const allOrdersStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
      where: whereDateClause,
    });

    const statusCountsMap: Record<string, number> = {
      PENDING: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    allOrdersStatus.forEach((item) => {
      statusCountsMap[item.status] = item._count;
    });

    // 4. Customer Metrics
    const totalCustomers = await prisma.customer.count({
      where: { deletedAt: null },
    });
    const newCustomersPeriod = startDate
      ? await prisma.customer.count({
          where: { createdAt: { gte: startDate }, deletedAt: null },
        })
      : totalCustomers;

    // 5. Inventory Metrics
    const inventoryItems = await prisma.inventoryItem.findMany();
    const totalItems = inventoryItems.length;
    const outOfStockCount = inventoryItems.filter((i) => i.quantityOnHand === 0).length;
    const lowStockCount = inventoryItems.filter(
      (i) => i.quantityOnHand > 0 && i.quantityOnHand <= i.reorderThreshold
    ).length;

    // 6. Operational Pending Items
    const pendingReturnsCount = await prisma.return.count({
      where: { status: 'REQUESTED' },
    });
    const pendingReviewsCount = await prisma.productReview.count({
      where: { isApproved: false },
    });

    // 7. Recent Orders (Top 5)
    const recentOrders = orders.slice(0, 5).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customer
        ? `${o.customer.firstName} ${o.customer.lastName}`
        : o.shippingName || 'Guest Customer',
      status: o.status,
      paymentStatus: o.paymentStatus,
      grandTotal: Number(o.grandTotal),
      createdAt: o.createdAt,
    }));

    // 8. Top Selling Products
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: whereDateClause,
      },
      include: { variant: { include: { product: true } } },
    });

    const productSalesMap = new Map<string, { name: string; sku: string; qty: number; revenue: number }>();
    orderItems.forEach((item) => {
      const prodName = item.variant?.product?.name || item.productName;
      const key = item.variant?.productId || item.sku;
      const existing = productSalesMap.get(key) || { name: prodName, sku: item.sku, qty: 0, revenue: 0 };
      existing.qty += item.quantity;
      existing.revenue += Number(item.lineTotal);
      productSalesMap.set(key, existing);
    });

    const topProducts = Array.from(productSalesMap.entries())
      .map(([id, val]) => ({
        productId: id,
        name: val.name,
        sku: val.sku,
        totalQuantitySold: val.qty,
        totalRevenue: val.revenue,
      }))
      .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, 5);

    // 9. Time Series Aggregation
    const timeMap = new Map<string, { gross: number; count: number }>();
    activeOrders.forEach((o) => {
      const dateKey = o.createdAt.toISOString().split('T')[0];
      const curr = timeMap.get(dateKey) || { gross: 0, count: 0 };
      curr.gross += Number(o.grandTotal);
      curr.count += 1;
      timeMap.set(dateKey, curr);
    });

    const timeSeries = Array.from(timeMap.entries())
      .map(([date, val]) => ({
        date,
        grossSales: val.gross,
        ordersCount: val.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      sales: {
        grossSales,
        netSales,
        orderCount,
        averageOrderValue,
        refundedAmount,
        discountTotal,
      },
      orderStatusCounts: {
        pending: statusCountsMap.PENDING || 0,
        processing: statusCountsMap.PROCESSING || 0,
        shipped: statusCountsMap.SHIPPED || 0,
        delivered: statusCountsMap.DELIVERED || 0,
        cancelled: statusCountsMap.CANCELLED || 0,
      },
      customers: {
        totalCustomers,
        newCustomersPeriod,
      },
      inventory: {
        totalItems,
        lowStockCount,
        outOfStockCount,
      },
      operations: {
        pendingReturnsCount,
        pendingReviewsCount,
      },
      recentOrders,
      topProducts,
      timeSeries,
    };
  } catch (err) {
    console.error('Failed to calculate admin dashboard metrics:', err);
    return getFallbackDashboardMetrics();
  }
}

function getFallbackDashboardMetrics(): DashboardMetrics {
  return {
    sales: { grossSales: 0, netSales: 0, orderCount: 0, averageOrderValue: 0, refundedAmount: 0, discountTotal: 0 },
    orderStatusCounts: { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 },
    customers: { totalCustomers: 0, newCustomersPeriod: 0 },
    inventory: { totalItems: 0, lowStockCount: 0, outOfStockCount: 0 },
    operations: { pendingReturnsCount: 0, pendingReviewsCount: 0 },
    recentOrders: [],
    topProducts: [],
    timeSeries: [],
  };
}
