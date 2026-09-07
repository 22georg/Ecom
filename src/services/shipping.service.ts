export interface ShippingMethodOption {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: string;
  isComplimentary: boolean;
}

export const FREE_SHIPPING_THRESHOLD = 5000; // ৳5,000 BDT

export const ShippingService = {
  /**
   * Get available shipping options based on cart subtotal
   */
  getAvailableShippingMethods(subtotal: number): ShippingMethodOption[] {
    const qualifiesForFree = subtotal >= FREE_SHIPPING_THRESHOLD;

    return [
      {
        id: 'standard',
        name: qualifiesForFree ? 'Complimentary Standard Shipping' : 'Standard Express Delivery',
        description: qualifiesForFree
          ? 'Unlocked: Complimentary carbon-neutral courier shipping'
          : 'Reliable nationwide door-to-door courier fulfillment',
        cost: qualifiesForFree ? 0 : 80, // ৳80 or ৳0
        estimatedDays: '2–3 Business Days',
        isComplimentary: qualifiesForFree,
      },
      {
        id: 'priority',
        name: 'Priority Overnight Dispatch',
        description: 'Guaranteed 24-hour priority dispatch with live telemetry',
        cost: 150, // ৳150 BDT
        estimatedDays: '24 Hours',
        isComplimentary: false,
      },
    ];
  },

  /**
   * Calculate selected shipping cost
   */
  calculateShippingCost(shippingMethodId: string | undefined | null, subtotal: number): number {
    const methods = this.getAvailableShippingMethods(subtotal);
    const selected = methods.find((m) => m.id === shippingMethodId) || methods[0];
    return selected.cost;
  },
};
