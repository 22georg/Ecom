import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export const DEFAULT_ADMIN_PERMISSIONS = [
  // Products
  { code: 'products.view', description: 'View product catalog and variants' },
  { code: 'products.create', description: 'Create new products and variants' },
  { code: 'products.update', description: 'Edit existing products and pricing' },
  { code: 'products.delete', description: 'Archive or delete products' },

  // Categories
  { code: 'categories.view', description: 'View categories and subcategories' },
  { code: 'categories.manage', description: 'Create, update, and reorder categories' },

  // Inventory
  { code: 'inventory.view', description: 'View warehouse stock levels' },
  { code: 'inventory.adjust', description: 'Perform manual stock adjustments' },

  // Customers
  { code: 'customers.view', description: 'View customer accounts and profiles' },
  { code: 'customers.manage', description: 'Update customer status and notes' },

  // Orders
  { code: 'orders.view', description: 'View order history and snapshots' },
  { code: 'orders.manage', description: 'Update order status and shipments' },
  { code: 'orders.cancel', description: 'Cancel orders and release stock' },

  // Returns & Refunds
  { code: 'returns.view', description: 'View customer return requests' },
  { code: 'returns.manage', description: 'Approve, reject, or receive returns' },
  { code: 'refunds.view', description: 'View refund history' },
  { code: 'refunds.manage', description: 'Issue customer refunds' },

  // Reviews
  { code: 'reviews.view', description: 'View customer product reviews' },
  { code: 'reviews.moderate', description: 'Approve or reject reviews' },

  // Coupons
  { code: 'coupons.view', description: 'View active discount coupons' },
  { code: 'coupons.manage', description: 'Create and edit promotional coupons' },

  // Shipping & Tax
  { code: 'shipping.view', description: 'View shipping rates and zones' },
  { code: 'shipping.manage', description: 'Configure shipping rules' },
  { code: 'tax.view', description: 'View tax configurations' },
  { code: 'tax.manage', description: 'Configure tax rates' },

  // Reports
  { code: 'reports.view', description: 'View operational reports and analytics' },
  { code: 'reports.export', description: 'Export operational reports to CSV' },

  // Admin Users & Roles
  { code: 'admin_users.view', description: 'View admin user directory' },
  { code: 'admin_users.manage', description: 'Create and edit admin users' },
  { code: 'roles.view', description: 'View admin roles and permission matrix' },
  { code: 'roles.manage', description: 'Configure custom admin roles' },

  // Audit Logs
  { code: 'audit_logs.view', description: 'View administrative audit trail' },
];

export async function seedAdminFoundation() {
  if (!process.env.DATABASE_URL) return;

  try {
    // 1. Seed Permissions
    const permissionMap = new Map<string, string>();
    for (const perm of DEFAULT_ADMIN_PERMISSIONS) {
      const dbPerm = await prisma.adminPermission.upsert({
        where: { code: perm.code },
        update: { description: perm.description },
        create: {
          code: perm.code,
          description: perm.description,
        },
      });
      permissionMap.set(perm.code, dbPerm.id);
    }

    // 2. Seed Roles
    const superAdminRole = await prisma.adminRole.upsert({
      where: { name: 'SuperAdmin' },
      update: { description: 'Full administrative control over all system domains' },
      create: {
        name: 'SuperAdmin',
        description: 'Full administrative control over all system domains',
      },
    });

    const catalogManagerRole = await prisma.adminRole.upsert({
      where: { name: 'CatalogManager' },
      update: { description: 'Catalog, category, product, and review moderation' },
      create: {
        name: 'CatalogManager',
        description: 'Catalog, category, product, and review moderation',
      },
    });

    const orderManagerRole = await prisma.adminRole.upsert({
      where: { name: 'OrderManager' },
      update: { description: 'Order fulfillment, shipments, returns, and refunds' },
      create: {
        name: 'OrderManager',
        description: 'Order fulfillment, shipments, returns, and refunds',
      },
    });

    // 3. Assign all permissions to SuperAdmin role
    const permIds = Array.from(permissionMap.values());
    for (const permId of permIds) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permId,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permId,
        },
      });
    }

    // 4. Seed SuperAdmin user
    const superAdminEmail = 'admin@marqivo.com';
    const superAdminPasswordHash = await hashPassword('MarqivoAdmin2026!');

    const adminUser = await prisma.adminUser.upsert({
      where: { email: superAdminEmail },
      update: {
        name: 'MARQIVO Lead Administrator',
        passwordHash: superAdminPasswordHash,
        isActive: true,
      },
      create: {
        email: superAdminEmail,
        name: 'MARQIVO Lead Administrator',
        passwordHash: superAdminPasswordHash,
        isActive: true,
      },
    });

    // Link admin user to SuperAdmin role
    await prisma.adminRoleUser.upsert({
      where: {
        adminUserId_roleId: {
          adminUserId: adminUser.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        adminUserId: adminUser.id,
        roleId: superAdminRole.id,
      },
    });

    console.log('✅ Admin RBAC and SuperAdmin user successfully initialized!');
  } catch (err) {
    console.error('Failed to seed admin foundation:', err);
  }
}
