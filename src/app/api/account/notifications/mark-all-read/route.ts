import { NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/auth';
import { NotificationService } from '@/services/notification.service';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const result = await NotificationService.markAllAsRead(customer.id);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
