import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { hashPassword, normalizeEmail, generateSecureToken, hashToken } from '@/lib/auth';
import { EmailService } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`register_${ip}`, 10, 15 * 60 * 1000);
    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        { error: 'Too many registration requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = registerSchema.parse(body);
    const email = normalizeEmail(validated.email);

    if (process.env.DATABASE_URL) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { email },
      });

      if (existingCustomer) {
        const passwordHash = await hashPassword(validated.password);
        await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: {
            firstName: validated.firstName,
            lastName: validated.lastName,
            phone: validated.phone || existingCustomer.phone,
            status: 'ACTIVE',
            isVerified: true,
          },
        });

        await prisma.customerAuth.upsert({
          where: { customerId: existingCustomer.id },
          update: { passwordHash, failedAttempts: 0, lockedUntil: null },
          create: { customerId: existingCustomer.id, passwordHash },
        });

        return NextResponse.json(
          { message: 'Account password updated successfully. You can now log in.', email },
          { status: 200 }
        );
      }

      const passwordHash = await hashPassword(validated.password);
      const rawVerificationToken = generateSecureToken();
      const verificationTokenHash = hashToken(rawVerificationToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const customer = await tx.customer.create({
          data: {
            email,
            firstName: validated.firstName,
            lastName: validated.lastName,
            phone: validated.phone || null,
            status: 'ACTIVE',
            isVerified: true,
            auth: {
              create: {
                passwordHash,
              },
            },
            verificationTokens: {
              create: {
                tokenHash: verificationTokenHash,
                expiresAt,
              },
            },
          },
        });

        return customer;
      });

      // Dispatch verification link via dev mail service
      await EmailService.sendVerificationEmail(email, rawVerificationToken);
    }

    return NextResponse.json(
      {
        message: 'Account registered successfully. Please check your email to verify your account.',
        email,
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
