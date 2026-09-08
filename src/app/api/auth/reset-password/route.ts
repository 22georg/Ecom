import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { hashPassword, hashToken, revokeAllCustomerSessions } from '@/lib/auth';

const resetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = resetSchema.parse(body);
    const tokenHash = hashToken(validated.token);

    if (process.env.DATABASE_URL) {
      const record = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
      });

      if (!record || record.usedAt || new Date() > record.expiresAt) {
        return NextResponse.json(
          { error: 'Your password reset token has expired or is invalid. Please request a new link.' },
          { status: 400 }
        );
      }

      const newPasswordHash = await hashPassword(validated.password);

      await prisma.$transaction([
        prisma.passwordResetToken.update({
          where: { id: record.id },
          data: { usedAt: new Date() },
        }),
        prisma.customerAuth.update({
          where: { customerId: record.customerId },
          data: { passwordHash: newPasswordHash, failedAttempts: 0 },
        }),
      ]);

      // Revoke existing sessions for security
      await revokeAllCustomerSessions(record.customerId);
    }

    return NextResponse.json({
      message: 'Password reset successfully. Please log in with your new password.',
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
  }
}
