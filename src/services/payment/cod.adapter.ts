import {
  PaymentProviderAdapter,
  PaymentInitiateInput,
  PaymentInitiateResult,
  PaymentVerifyInput,
  PaymentVerifyResult,
  PaymentRefundInput,
  PaymentRefundResult,
} from './payment-provider.interface';

export class CashOnDeliveryAdapter implements PaymentProviderAdapter {
  providerCode = 'COD';

  async initiatePayment(input: PaymentInitiateInput): Promise<PaymentInitiateResult> {
    const transactionRef = `COD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      success: true,
      transactionRef,
      payload: {
        method: 'CASH_ON_DELIVERY',
        note: 'Payment to be collected upon physical order delivery',
        currency: input.currency || 'BDT',
        amount: input.amount,
      },
    };
  }

  async verifyPayment(input: PaymentVerifyInput): Promise<PaymentVerifyResult> {
    return {
      success: true,
      paidAmount: 0, // Not paid online
      currency: 'BDT',
      transactionRef: input.transactionRef,
      status: 'PENDING',
      payload: { verifiedAt: new Date().toISOString(), note: 'COD status remains PENDING until delivery confirmation' },
    };
  }

  async refundPayment(input: PaymentRefundInput): Promise<PaymentRefundResult> {
    return {
      success: true,
      refundId: `REF-COD-${Date.now()}`,
      status: 'COMPLETED',
    };
  }
}
