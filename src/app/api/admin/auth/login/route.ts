import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { createAdminSession } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const dbUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.SUPABASE_URL;

    // 1. SuperAdmin Emergency / Demo Fallback Check
    if (cleanEmail === 'admin@marqivo.com' && (password === 'MarqivoAdmin2026!' || password === 'admin')) {
      const userAgent = request.headers.get('user-agent') || undefined;
      const ipAddress = request.headers.get('x-forwarded-for') || undefined;

      await createAdminSession('superadmin-id', userAgent, ipAddress);

      return NextResponse.json({
        success: true,
        message: 'Admin authentication successful (SuperAdmin).',
        user: {
          id: 'superadmin-id',
          email: 'admin@marqivo.com',
          name: 'MARQIVO Lead Administrator',
          roles: ['SuperAdmin'],
        },
      });
    }

    if (dbUrl) {
      let adminUser = null;
      try {
        adminUser = await prisma.adminUser.findUnique({
          where: { email: cleanEmail },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        });
      } catch (dbErr) {
        console.warn('PostgreSQL DB query failed, evaluating admin auth:', dbErr);
      }

      if (adminUser) {
        const isValid = await verifyPassword(password, adminUser.passwordHash);
        if (isValid) {
          const userAgent = request.headers.get('user-agent') || undefined;
          const ipAddress = request.headers.get('x-forwarded-for') || undefined;

          await createAdminSession(adminUser.id, userAgent, ipAddress);

          return NextResponse.json({
            success: true,
            message: 'Admin authentication successful.',
            user: {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.name,
              roles: adminUser.roles.map((r: any) => r.role.name),
            },
          });
        }

        return NextResponse.json({ success: false, error: 'Invalid administrator credentials.' }, { status: 401 });
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid administrator credentials.' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Login failed.' }, { status: 500 });
  }
}
