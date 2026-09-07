import { NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/auth';
import { NotificationService } from '@/services/notification.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const data = await NotificationService.getCustomerNotifications(customer.id);
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
