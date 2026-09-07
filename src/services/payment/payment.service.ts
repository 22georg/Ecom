import { PaymentProviderAdapter } from './payment-provider.interface';
import { CashOnDeliveryAdapter } from './cod.adapter';
import { OnlineGatewayAdapter } from './online-gateway.adapter';

class PaymentServiceManager {
  private adapters: Map<string, PaymentProviderAdapter> = new Map();

  constructor() {
    const cod = new CashOnDeliveryAdapter();
    const online = new OnlineGatewayAdapter();

    this.registerAdapter('COD', cod);
    this.registerAdapter('CASH_ON_DELIVERY', cod);
    this.registerAdapter('ONLINE_GATEWAY', online);
    this.registerAdapter('CARD', online);
    this.registerAdapter('MOBILE_BANKING', online);
    this.registerAdapter('SSLCOMMERZ', online);
    this.registerAdapter('STRIPE', online);
    this.registerAdapter('BKASH', online);
  }

  registerAdapter(code: string, adapter: PaymentProviderAdapter) {
    this.adapters.set(code.toUpperCase(), adapter);
  }

  getAdapter(providerCode: string): PaymentProviderAdapter {
    const key = (providerCode || 'COD').toUpperCase();
    const adapter = this.adapters.get(key);
    if (!adapter) {
      // Fallback to COD if unknown
      return this.adapters.get('COD')!;
    }
    return adapter;
  }
}

export const PaymentService = new PaymentServiceManager();
