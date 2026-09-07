import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { normalizeEmail, generateSecureToken, hashToken } from '@/lib/auth';
import { EmailService } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`forgot_${ip}`, 5, 15 * 60 * 1000);
    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait 15 minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = forgotSchema.parse(body);
    const email = normalizeEmail(validated.email);

    if (process.env.DATABASE_URL) {
      const customer = await prisma.customer.findUnique({ where: { email } });

      if (customer && customer.isActive && !customer.deletedAt) {
        const rawToken = generateSecureToken();
        const tokenHash = hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.passwordResetToken.create({
          data: {
            customerId: customer.id,
            tokenHash,
            expiresAt,
          },
        });

        await EmailService.sendPasswordResetEmail(email, rawToken);
      }
    }

    // Account enumeration protection
    return NextResponse.json({
      message: 'If an account exists for that email address, you will receive password reset instructions.',
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.errors.map((e) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
}
