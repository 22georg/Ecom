import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getCurrentCustomer } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const updateAddressSchema = z.object({
  label: z.string().optional(),
  recipientName: z.string().min(1, 'Recipient name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().default('BD'),
  isDefaultShip: z.boolean().optional(),
  isDefaultBill: z.boolean().optional(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addressId = params.id;
    const body = await request.json();
    const validated = updateAddressSchema.parse(body);

    if (process.env.DATABASE_URL) {
      // IDOR Verification
      const existing = await prisma.customerAddress.findUnique({
        where: { id: addressId },
      });

      if (!existing || existing.customerId !== customer.id) {
        return NextResponse.json({ error: 'Address not found or access denied' }, { status: 404 });
      }

      return await prisma.$transaction(async (tx) => {
        if (validated.isDefaultShip) {
          await tx.customerAddress.updateMany({
            where: { customerId: customer.id, isDefaultShip: true, NOT: { id: addressId } },
            data: { isDefaultShip: false },
          });
        }

        if (validated.isDefaultBill) {
          await tx.customerAddress.updateMany({
            where: { customerId: customer.id, isDefaultBill: true, NOT: { id: addressId } },
            data: { isDefaultBill: false },
          });
        }

        const updated = await tx.customerAddress.update({
          where: { id: addressId },
          data: {
            label: validated.label,
            recipientName: validated.recipientName,
            phone: validated.phone,
            addressLine1: validated.addressLine1,
            addressLine2: validated.addressLine2 || null,
            city: validated.city,
            state: validated.state,
            postalCode: validated.postalCode,
            country: validated.country,
            isDefaultShip: validated.isDefaultShip,
            isDefaultBill: validated.isDefaultBill,
          },
        });

        return NextResponse.json({ message: 'Address updated successfully', address: updated });
      });
    }

    return NextResponse.json({ message: 'Address updated (dev mode)' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.errors.map((e) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addressId = params.id;

    if (process.env.DATABASE_URL) {
      // IDOR Verification
      const existing = await prisma.customerAddress.findUnique({
        where: { id: addressId },
      });

      if (!existing || existing.customerId !== customer.id) {
        return NextResponse.json({ error: 'Address not found or access denied' }, { status: 404 });
      }

      await prisma.customerAddress.delete({
        where: { id: addressId },
      });
    }

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
