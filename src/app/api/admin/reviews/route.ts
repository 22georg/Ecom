import { NextResponse } from 'next/server';
import { requireAdminPermission } from '@/lib/admin-auth';
import { getAdminReviews, moderateAdminReview } from '@/services/admin-review.service';

export async function GET(request: Request) {
  const authCheck = await requireAdminPermission('reviews.view');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const { searchParams } = new URL(request.url);
  const statusFilter = (searchParams.get('status') || 'ALL') as any;

  const reviews = await getAdminReviews(statusFilter);

  return NextResponse.json({
    success: true,
    reviews,
  });
}

export async function PATCH(request: Request) {
  const authCheck = await requireAdminPermission('reviews.moderate');
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const { reviewId, isApproved } = body;

    if (!reviewId || typeof isApproved !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Review ID and approval state are required.' }, { status: 400 });
    }

    const updated = await moderateAdminReview(authCheck.adminUser.id, reviewId, isApproved);

    return NextResponse.json({
      success: true,
      review: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Moderation failed.' }, { status: 400 });
  }
}
