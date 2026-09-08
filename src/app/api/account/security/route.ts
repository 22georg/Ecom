import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getCurrentCustomer, verifyPassword, hashPassword, revokeAllCustomerSessions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(100),
});

export async function POST(request: Request) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = changePasswordSchema.parse(body);

    if (process.env.DATABASE_URL) {
      const auth = await prisma.customerAuth.findUnique({
        where: { customerId: customer.id },
      });

      if (!auth) {
        return NextResponse.json({ error: 'Authentication record not found' }, { status: 404 });
      }

      const isValid = await verifyPassword(validated.currentPassword, auth.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      const newPasswordHash = await hashPassword(validated.newPassword);

      await prisma.customerAuth.update({
        where: { customerId: customer.id },
        data: { passwordHash: newPasswordHash, failedAttempts: 0 },
      });

      await revokeAllCustomerSessions(customer.id);
    }

    return NextResponse.json({
      message: 'Password changed successfully. Please log in again if required.',
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
