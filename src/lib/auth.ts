import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

const SESSION_COOKIE_NAME = 'mq_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
const SALT_ROUNDS = 12;

export interface AuthenticatedCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
  isVerified: boolean;
  status: string;
}

/**
 * Hash plaintext password using bcrypt with 12 salt rounds
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify plaintext password against stored bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Normalize email (lowercase + trimmed)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Generate cryptographically secure random hex token
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash raw token (SHA-256) for database storage
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Create a new authenticated session in PostgreSQL & set HTTP-Only cookie
 */
export async function createSession(customerId: string, userAgent?: string, ipAddress?: string): Promise<string> {
  const rawSessionToken = generateSecureToken();
  const tokenHash = hashToken(rawSessionToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  if (process.env.DATABASE_URL) {
    try {
      await prisma.customerSession.create({
        data: {
          customerId,
          tokenHash,
          userAgent: userAgent || 'Unknown Browser',
          ipAddress: ipAddress || '127.0.0.1',
          expiresAt,
        },
      });
    } catch (err) {
      console.warn('PostgreSQL DB not connected, creating session cookie directly:', err);
    }
  }

  // Set HTTP-Only Cookie
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawSessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  return rawSessionToken;
}

/**
 * Retrieve current authenticated customer derived strictly from HTTP-Only session cookie
 */
export async function getCurrentCustomer(): Promise<AuthenticatedCustomer | null> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) return null;

    const tokenHash = hashToken(sessionToken);

    if (!process.env.DATABASE_URL) return null;

    const session = await prisma.customerSession.findUnique({
      where: { tokenHash },
      include: { customer: true },
    });

    if (!session || session.revokedAt || new Date() > session.expiresAt) {
      return null;
    }

    const { customer } = session;
    if (!customer.isActive || customer.deletedAt) {
      return null;
    }

    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      isActive: customer.isActive,
      isVerified: customer.isVerified,
      status: customer.status,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Revoke current session & clear cookie
 */
export async function revokeCurrentSession(): Promise<void> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken && process.env.DATABASE_URL) {
      const tokenHash = hashToken(sessionToken);
      await prisma.customerSession.updateMany({
        where: { tokenHash },
        data: { revokedAt: new Date() },
      });
    }

    cookieStore.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (err) {
    // Graceful fallback
  }
}

/**
 * Revoke all active sessions for a customer (e.g. after password change)
 */
export async function revokeAllCustomerSessions(customerId: string): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    await prisma.customerSession.updateMany({
      where: { customerId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } catch (err) {
    console.error('Failed to revoke customer sessions:', err);
  }
}
