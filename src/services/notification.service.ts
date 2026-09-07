import { prisma } from '@/lib/db';

export interface SendNotificationParams {
  customerId: string;
  type: 'ORDER_STATUS' | 'PROMO' | 'SECURITY';
  title: string;
  message: string;
  actionUrl?: string;
}

export const NotificationService = {
  /**
   * Persist a customer notification in PostgreSQL
   */
  async sendNotification(params: SendNotificationParams) {
    try {
      return await prisma.notification.create({
        data: {
          customerId: params.customerId,
          type: params.type,
          title: params.title,
          message: params.message,
          actionUrl: params.actionUrl || null,
          isRead: false,
        },
      });
    } catch (err) {
      console.error('Failed to create notification:', err);
      return null;
    }
  },

  /**
   * Get all notifications for an authenticated customer with unread count
   */
  async getCustomerNotifications(customerId: string) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      });

      const unreadCount = notifications.filter((n) => !n.isRead).length;

      return {
        unreadCount,
        notifications: notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          actionUrl: n.actionUrl,
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
        })),
      };
    } catch (err) {
      return { unreadCount: 0, notifications: [] };
    }
  },

  /**
   * Mark single notification as read with IDOR check
   */
  async markAsRead(notificationId: string, customerId: string) {
    try {
      await prisma.notification.updateMany({
        where: { id: notificationId, customerId },
        data: { isRead: true },
      });
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  },

  /**
   * Mark all notifications as read for a customer
   */
  async markAllAsRead(customerId: string) {
    try {
      await prisma.notification.updateMany({
        where: { customerId, isRead: false },
        data: { isRead: true },
      });
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  },
};
