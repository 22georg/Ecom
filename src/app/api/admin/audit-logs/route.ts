import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const authCheck = await requireAdminPermission('audit_logs.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get('entityType') || undefined;

  if (!process.env.DATABASE_URL) return NextResponse.json({ success: true, logs: [] });

  try {
    const where: any = {};
    if (entityType) where.entityType = entityType;

    const logs = await prisma.adminAuditLog.findMany({
      where,
      include: { adminUser: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      logs: logs.map((l) => ({
        id: l.id,
        adminUser: {
          id: l.adminUser.id,
          name: l.adminUser.name,
          email: l.adminUser.email,
        },
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        payload: l.payload ? JSON.parse(l.payload) : null,
        createdAt: l.createdAt,
      })),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch audit logs.' }, { status: 500 });
  }
}
