import { PaymentStatus } from '@prisma/client';

export interface PaymentInitiateInput {
  orderNumber: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentInitiateResult {
  success: boolean;
  transactionRef: string;
  redirectUrl?: string;
  payload?: Record<string, any>;
  errorMessage?: string;
}

export interface PaymentVerifyInput {
  transactionRef: string;
  paymentId?: string;
  payload?: Record<string, any>;
}

export interface PaymentVerifyResult {
  success: boolean;
  paidAmount: number;
  currency: string;
  transactionRef: string;
  status: PaymentStatus;
  payload?: Record<string, any>;
  errorMessage?: string;
}

export interface PaymentRefundInput {
  paymentId: string;
  amount: number;
  reason?: string;
}

export interface PaymentRefundResult {
  success: boolean;
  refundId?: string;
  status: string;
  errorMessage?: string;
}

export interface PaymentProviderAdapter {
  providerCode: string;
  initiatePayment(input: PaymentInitiateInput): Promise<PaymentInitiateResult>;
  verifyPayment(input: PaymentVerifyInput): Promise<PaymentVerifyResult>;
  refundPayment(input: PaymentRefundInput): Promise<PaymentRefundResult>;
}
