'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FormattedCart } from '@/services/cart.service';
import { useToast } from '@/components/ui/Toast';

interface CartContextType {
  cart: FormattedCart | null;
  itemCount: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (variantId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
  removeItem: (cartItemId: string) => Promise<boolean>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => Promise<boolean>;
  selectShippingMethod: (shippingMethodId: string) => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const [cart, setCart] = useState<FormattedCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const refreshCart = async () => {
    try {
      const res = await fetch('/api/cart', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.cart) setCart(data.cart);
      }
    } catch (err) {
      console.warn('Failed to fetch cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const addToCart = async (variantId: string, quantity: number = 1): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, quantity }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast({
          type: 'error',
          title: 'Stock & Inventory Limit',
          description: data.message || 'Failed to add product to cart.',
        });
        return false;
      }

      if (data.cart) setCart(data.cart);
      addToast({
        type: 'success',
        title: 'Added to Cart',
        description: data.message || 'Product successfully added.',
      });
      setIsDrawerOpen(true);
      return true;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Connection Error',
        description: 'Failed to communicate with cart service.',
      });
      return false;
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/cart/items/${cartItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast({
          type: 'error',
          title: 'Stock Warning',
          description: data.message || 'Cannot increase quantity beyond stock limit.',
        });
        return false;
      }

      if (data.cart) setCart(data.cart);
      return true;
    } catch (err) {
      return false;
    }
  };

  const removeItem = async (cartItemId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/cart/items/${cartItemId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.cart) {
        setCart(data.cart);
        addToast({
          type: 'info',
          title: 'Item Removed',
          description: 'Cart item removed.',
        });
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/cart/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (data.cart) setCart(data.cart);

      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Invalid promo code.' };
      }

      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: 'Failed to process promo code.' };
    }
  };

  const removeCoupon = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart/coupon', { method: 'DELETE' });
      const data = await res.json();
      if (data.cart) setCart(data.cart);
      addToast({ type: 'neutral', title: 'Coupon Removed', description: 'Promo code removed.' });
      return true;
    } catch (err) {
      return false;
    }
  };

  const selectShippingMethod = async (shippingMethodId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart/shipping-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingMethodId }),
      });

      const data = await res.json();
      if (data.cart) setCart(data.cart);
      return true;
    } catch (err) {
      return false;
    }
  };

  const itemCount = cart?.itemCount || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isLoading,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addToCart,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        selectShippingMethod,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
