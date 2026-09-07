import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PaymentService } from '@/services/payment/payment.service';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { provider, transactionRef } = payload;

    if (!provider || !transactionRef) {
      return NextResponse.json(
        { success: false, message: 'Missing provider or transaction reference' },
        { status: 400 }
      );
    }

    // 1. Verify payment via Adapter
    const adapter = PaymentService.getAdapter(provider);
    const verification = await adapter.verifyPayment({
      transactionRef,
      payload,
    });

    if (!verification.success) {
      return NextResponse.json(
        { success: false, message: verification.errorMessage || 'Verification failed' },
        { status: 400 }
      );
    }

    // 2. Idempotency Check: Find Payment by transactionRef
    const existingPayment = await prisma.payment.findFirst({
      where: { transactionRef },
      include: { order: true },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { success: false, message: 'Payment record not found' },
        { status: 444 }
      );
    }

    // Idempotency: Ignore if already marked PAID
    if (existingPayment.status === 'PAID') {
      return NextResponse.json({
        success: true,
        message: 'Webhook duplicate event ignored (Already processed)',
      });
    }

    // 3. Atomically Update Payment & Order Status
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: verification.status,
          payload: JSON.stringify(verification.payload || {}),
        },
      }),
      prisma.order.update({
        where: { id: existingPayment.orderId },
        data: {
          paymentStatus: verification.status,
          status: verification.status === 'PAID' ? 'PROCESSING' : 'PENDING',
        },
      }),
      prisma.systemEvent.create({
        data: {
          eventType: verification.status === 'PAID' ? 'payment.succeeded' : 'payment.failed',
          payload: JSON.stringify({
            orderId: existingPayment.orderId,
            transactionRef,
            status: verification.status,
          }),
          status: 'PROCESSED',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${verification.status}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Webhook processing error' },
      { status: 500 }
    );
  }
}
