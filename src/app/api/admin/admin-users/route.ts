import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { logAdminAction } from '@/services/admin-audit.service';

export async function GET() {
  const authCheck = await requireAdminPermission('admin_users.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  if (!process.env.DATABASE_URL) return NextResponse.json({ success: true, users: [] });

  try {
    const adminUsers = await prisma.adminUser.findMany({
      include: {
        roles: { include: { role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      users: adminUsers.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        isActive: u.isActive,
        roles: u.roles.map((r: any) => ({ id: r.role.id, name: r.role.name })),
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch admin users.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authCheck = await requireAdminPermission('admin_users.manage');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const { email, name, password, roleId } = body;

    if (!email || !name || !password || !roleId) {
      return NextResponse.json({ success: false, error: 'Email, name, password, and role are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.adminUser.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ success: false, error: `Admin user "${cleanEmail}" already exists.` }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.adminUser.create({
      data: {
        email: cleanEmail,
        name,
        passwordHash,
        roles: {
          create: [{ roleId }],
        },
      },
      include: { roles: { include: { role: true } } },
    });

    await logAdminAction({
      adminUserId: authCheck.adminUser.id,
      action: 'ADMIN_USER_CREATED',
      entityType: 'AdminUser',
      entityId: newUser.id,
      payload: { email: cleanEmail, name, roleId },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        roles: newUser.roles.map((r: any) => r.role.name),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Creation failed.' }, { status: 400 });
  }
}
