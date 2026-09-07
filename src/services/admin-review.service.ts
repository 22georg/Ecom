import { prisma } from '@/lib/db';
import { logAdminAction } from '@/services/admin-audit.service';

export async function getAdminReviews(statusFilter?: 'ALL' | 'PENDING' | 'APPROVED') {
  if (!process.env.DATABASE_URL) return [];

  try {
    const where: any = {};
    if (statusFilter === 'PENDING') where.isApproved = false;
    if (statusFilter === 'APPROVED') where.isApproved = true;

    const reviews = await prisma.productReview.findMany({
      where,
      include: {
        product: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: r.product.name,
      productSlug: r.product.slug,
      customerName: `${r.customer.firstName} ${r.customer.lastName}`,
      customerEmail: r.customer.email,
      isVerifiedPurchase: r.isVerifiedPurchase,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isApproved: r.isApproved,
      createdAt: r.createdAt,
    }));
  } catch (err) {
    console.error('Failed to fetch admin reviews:', err);
    return [];
  }
}

export async function moderateAdminReview(adminUserId: string, reviewId: string, isApproved: boolean) {
  if (!process.env.DATABASE_URL) throw new Error('Database not connected');

  const review = await prisma.productReview.update({
    where: { id: reviewId },
    data: { isApproved },
  });

  // Recalculate average rating & review count for the product
  const approvedReviews = await prisma.productReview.findMany({
    where: { productId: review.productId, isApproved: true },
  });

  const count = approvedReviews.length;
  const avg = count > 0 ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count : 0.0;

  await prisma.product.update({
    where: { id: review.productId },
    data: {
      ratingAvg: avg,
      reviewCount: count,
    },
  });

  await logAdminAction({
    adminUserId,
    action: isApproved ? 'REVIEW_APPROVED' : 'REVIEW_REJECTED',
    entityType: 'ProductReview',
    entityId: review.id,
    payload: { productId: review.productId, isApproved },
  });

  return review;
}
