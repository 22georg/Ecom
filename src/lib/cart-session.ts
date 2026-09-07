import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getCurrentCustomer } from '@/lib/auth';

const GUEST_CART_COOKIE_NAME = 'mq_cart_token';
const GUEST_CART_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface CartIdentity {
  customerId?: string;
  guestToken?: string;
}

/**
 * Generate cryptographically secure random token for guest carts
 */
export function generateGuestToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Retrieve or create guest cart session token stored in HTTP-Only cookie
 */
export function getOrCreateGuestCartToken(): string {
  const cookieStore = cookies();
  let guestToken = cookieStore.get(GUEST_CART_COOKIE_NAME)?.value;

  if (!guestToken) {
    guestToken = generateGuestToken();
    try {
      cookieStore.set(GUEST_CART_COOKIE_NAME, guestToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: GUEST_CART_MAX_AGE,
      });
    } catch (err) {
      // In server components where set is restricted, return generated token
    }
  }

  return guestToken;
}

/**
 * Read existing guest cart session token if present
 */
export function getGuestCartToken(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get(GUEST_CART_COOKIE_NAME)?.value;
}

/**
 * Clear guest cart cookie (invoked after cart merge into customer account)
 */
export function clearGuestCartToken(): void {
  try {
    const cookieStore = cookies();
    cookieStore.delete(GUEST_CART_COOKIE_NAME);
  } catch (err) {
    // Graceful fallback
  }
}

/**
 * Resolve current cart identity: returns customerId if logged in, otherwise guestToken
 */
export async function getCartIdentity(): Promise<CartIdentity> {
  const customer = await getCurrentCustomer();
  if (customer) {
    return { customerId: customer.id };
  }

  const guestToken = getOrCreateGuestCartToken();
  return { guestToken };
}
