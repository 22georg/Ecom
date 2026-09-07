import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    const tokenHash = hashToken(token);

    if (process.env.DATABASE_URL) {
      const record = await prisma.emailVerificationToken.findUnique({
        where: { tokenHash },
        include: { customer: true },
      });

      if (!record || record.usedAt || new Date() > record.expiresAt) {
        return NextResponse.json(
          { error: 'Your verification link has expired or is invalid. Please request a new link.' },
          { status: 400 }
        );
      }

      await prisma.$transaction([
        prisma.emailVerificationToken.update({
          where: { id: record.id },
          data: { usedAt: new Date() },
        }),
        prisma.customer.update({
          where: { id: record.customerId },
          data: { isVerified: true, status: 'ACTIVE' },
        }),
      ]);
    }

    return NextResponse.json({ message: 'Email address verified successfully. You can now log in.' });
  } catch (err) {
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
