import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getCurrentCustomer } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().optional(),
});

export async function PUT(request: Request) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateProfileSchema.parse(body);

    if (process.env.DATABASE_URL) {
      const updated = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          firstName: validated.firstName,
          lastName: validated.lastName,
          phone: validated.phone || null,
        },
      });

      return NextResponse.json({
        message: 'Profile updated successfully',
        customer: {
          id: updated.id,
          email: updated.email,
          firstName: updated.firstName,
          lastName: updated.lastName,
          phone: updated.phone,
        },
      });
    }

    return NextResponse.json({
      message: 'Dev mode profile updated',
      customer: { ...customer, ...validated },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
