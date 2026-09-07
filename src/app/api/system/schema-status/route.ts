import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-dynamic';

export async function GET() {
  let isDbConnected = false;
  let modelStats = {
    categories: 0,
    products: 0,
    orders: 0,
    customers: 0,
    warehouses: 0,
  };

  if (process.env.DATABASE_URL) {
    try {
      const categoriesCount = await prisma.category.count();
      const productsCount = await prisma.product.count();
      const ordersCount = await prisma.order.count();
      const customersCount = await prisma.customer.count();
      const warehousesCount = await prisma.warehouse.count();

      isDbConnected = true;
      modelStats = {
        categories: categoriesCount,
        products: productsCount,
        orders: ordersCount,
        customers: customersCount,
        warehouses: warehousesCount,
      };
    } catch (err) {
      isDbConnected = false;
    }
  }

  return NextResponse.json(
    {
      status: 'ok',
      service: siteConfig.name,
      tagline: siteConfig.tagline,
      timestamp: new Date().toISOString(),
      databaseEngine: 'PostgreSQL (Prisma ORM)',
      railwayTargetConfigured: true,
      databaseConnected: isDbConnected,
      connectionStringProvided: Boolean(process.env.DATABASE_URL),
      schemaEntityCount: 27,
      domainGroups: [
        'Customer Domain (Customer, CustomerAuth, CustomerAddress)',
        'Catalog Domain (Category, Brand, Product, ProductVariant, ProductOption, ProductOptionValue, ProductVariantOption, ProductMedia)',
        'Inventory Domain (Warehouse, InventoryItem, InventoryMovement)',
        'Commerce Domain (Cart, CartItem, Wishlist, WishlistItem, Coupon)',
        'Order & Shipping Domain (Order, OrderItem, Payment, Shipment, Return, ReturnItem, Refund)',
        'Engagement Domain (ProductReview, Notification)',
        'Admin Domain (AdminUser, AdminRole, AdminPermission, RolePermission, AdminAuditLog)',
        'System Domain (SystemEvent)',
      ],
      modelStats,
    },
    { status: 200 }
  );
}
