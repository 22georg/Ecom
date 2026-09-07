import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/auth';
import { ReturnService } from '@/services/return.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const returns = await ReturnService.getCustomerReturns(customer.id);
    return NextResponse.json({
      success: true,
      data: returns,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch returns' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!body.orderId || !body.reason || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please select items and reason for return.' },
        { status: 400 }
      );
    }

    const createdReturn = await ReturnService.createReturnRequest(customer.id, {
      orderId: body.orderId,
      reason: body.reason,
      customerNote: body.customerNote,
      items: body.items,
    });

    return NextResponse.json({
      success: true,
      message: 'Return request submitted successfully.',
      data: createdReturn,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to submit return request' },
      { status: 400 }
    );
  }
}
