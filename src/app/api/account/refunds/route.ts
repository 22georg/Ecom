import { NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/auth';
import { RefundService } from '@/services/refund.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const refunds = await RefundService.getCustomerRefunds(customer.id);
    return NextResponse.json({
      success: true,
      data: refunds,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch refunds' },
      { status: 500 }
    );
  }
}
