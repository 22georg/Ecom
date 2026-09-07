import { CartService, FormattedCart } from './cart.service';

export interface CheckoutValidationResult {
  isValid: boolean;
  cart: FormattedCart | null;
  warnings: string[];
  errors: string[];
}

export const CheckoutService = {
  /**
   * Revalidate active cart before entering checkout or submitting order
   */
  async validateCheckoutCart(cartId: string): Promise<CheckoutValidationResult> {
    const warnings: string[] = [];
    const errors: string[] = [];

    // 1. Fetch calculated cart
    const calculatedCart = await CartService.getCalculatedCart(cartId);

    if (!calculatedCart || !calculatedCart.items || calculatedCart.items.length === 0) {
      errors.push('Your shopping cart is empty.');
      return { isValid: false, cart: null, warnings, errors };
    }

    // 2. Validate items & stock availability
    for (const item of calculatedCart.items) {
      if (item.stockStatus === 'out_of_stock') {
        errors.push(`"${item.productName}" (${item.variantLabel}) is currently out of stock.`);
      } else if (item.quantity > item.stockQty) {
        warnings.push(
          `Only ${item.stockQty} units available for "${item.productName}" (${item.variantLabel}).`
        );
      }
    }

    const isValid = errors.length === 0;
    return {
      isValid,
      cart: calculatedCart,
      warnings,
      errors,
    };
  },
};
