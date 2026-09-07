import { NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ authenticated: false, customer: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    customer,
  });
}
