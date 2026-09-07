import { prisma } from '@/lib/db';

export interface AuditLogOptions {
  adminUserId: string;
  action: string; // e.g., 'PRODUCT_CREATED', 'STOCK_ADJUSTED', 'ORDER_STATUS_CHANGED'
  entityType: string; // e.g., 'Product', 'InventoryItem', 'Order', 'Return'
  entityId: string;
  payload?: any;
}

export async function logAdminAction(options: AuditLogOptions): Promise<void> {
  if (!process.env.DATABASE_URL) return;

  try {
    const payloadString = options.payload ? JSON.stringify(options.payload) : null;
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: options.adminUserId,
        action: options.action,
        entityType: options.entityType,
        entityId: options.entityId,
        payload: payloadString,
      },
    });
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }
}
