import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { getCurrentCustomer } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const addressSchema = z.object({
  label: z.string().optional(),
  recipientName: z.string().min(1, 'Recipient name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/District is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().default('BD'),
  isDefaultShip: z.boolean().optional(),
  isDefaultBill: z.boolean().optional(),
});

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (process.env.DATABASE_URL) {
    const addresses = await prisma.customerAddress.findMany({
      where: { customerId: customer.id },
      orderBy: [{ isDefaultShip: 'desc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ addresses });
  }

  return NextResponse.json({ addresses: [] });
}

export async function POST(request: Request) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = addressSchema.parse(body);

    if (process.env.DATABASE_URL) {
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Handle Default Shipping Flag
        if (validated.isDefaultShip) {
          await tx.customerAddress.updateMany({
            where: { customerId: customer.id, isDefaultShip: true },
            data: { isDefaultShip: false },
          });
        }

        // Handle Default Billing Flag
        if (validated.isDefaultBill) {
          await tx.customerAddress.updateMany({
            where: { customerId: customer.id, isDefaultBill: true },
            data: { isDefaultBill: false },
          });
        }

        const address = await tx.customerAddress.create({
          data: {
            customerId: customer.id,
            label: validated.label || 'Home',
            recipientName: validated.recipientName,
            phone: validated.phone,
            addressLine1: validated.addressLine1,
            addressLine2: validated.addressLine2 || null,
            city: validated.city,
            state: validated.state,
            postalCode: validated.postalCode,
            country: validated.country || 'BD',
            isDefaultShip: validated.isDefaultShip || false,
            isDefaultBill: validated.isDefaultBill || false,
          },
        });

        return NextResponse.json({ message: 'Address added successfully', address }, { status: 201 });
      });
    }

    return NextResponse.json({ message: 'Address created (dev mode)' }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}
