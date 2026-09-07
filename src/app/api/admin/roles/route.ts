import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const authCheck = await requireAdminPermission('roles.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  if (!process.env.DATABASE_URL) return NextResponse.json({ success: true, roles: [], permissions: [] });

  try {
    const [roles, permissions] = await Promise.all([
      prisma.adminRole.findMany({
        include: {
          permissions: { include: { permission: true } },
          _count: { select: { users: true } },
        },
      }),
      prisma.adminPermission.findMany({
        orderBy: { code: 'asc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        userCount: r._count.users,
        permissions: r.permissions.map((p) => p.permission.code),
      })),
      permissions: permissions.map((p) => ({
        id: p.id,
        code: p.code,
        description: p.description,
      })),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch roles matrix.' }, { status: 500 });
  }
}
