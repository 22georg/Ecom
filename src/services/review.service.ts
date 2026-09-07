import { prisma } from '@/lib/db';
import { sanitizeHtml } from '@/lib/sanitize-html';

export interface SubmitReviewInput {
  productId: string;
  orderItemId?: string;
  rating: number; // 1 to 5
  title?: string;
  comment?: string;
}

export const ReviewService = {
  /**
   * Submit product review with purchase verification and rating aggregation
   */
  async submitReview(customerId: string, input: SubmitReviewInput) {
    if (input.rating < 1 || input.rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5 stars.');
    }

    // 1. Verify if customer purchased this product
    const purchasedOrderItem = await prisma.orderItem.findFirst({
      where: {
        order: { customerId, status: { in: ['DELIVERED', 'SHIPPED', 'PROCESSING'] } },
        variant: { productId: input.productId },
      },
    });

    const isVerifiedPurchase = Boolean(purchasedOrderItem);

    // 2. Sanitize title and comment
    const cleanTitle = input.title ? sanitizeHtml(input.title).slice(0, 150) : null;
    const cleanComment = input.comment ? sanitizeHtml(input.comment).slice(0, 2000) : null;

    // 3. Create Product Review Record
    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.productReview.create({
        data: {
          productId: input.productId,
          customerId,
          orderItemId: purchasedOrderItem?.id || input.orderItemId || null,
          isVerifiedPurchase,
          rating: input.rating,
          title: cleanTitle,
          comment: cleanComment,
          isApproved: true, // Auto-approve for demo / configurable moderation
        },
      });

      // Recalculate Product ratingAvg & reviewCount
      const stats = await tx.productReview.aggregate({
        where: { productId: input.productId, isApproved: true },
        _avg: { rating: true },
        _count: { rating: true },
      });

      const avgRating = stats._avg.rating || 0;
      const count = stats._count.rating || 0;

      await tx.product.update({
        where: { id: input.productId },
        data: {
          ratingAvg: avgRating,
          reviewCount: count,
        },
      });

      return created;
    });

    return review;
  },

  /**
   * Fetch approved reviews and rating breakdown for PDP
   */
  async getProductReviews(productId: string) {
    try {
      const reviews = await prisma.productReview.findMany({
        where: { productId, isApproved: true },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let sum = 0;

      reviews.forEach((r) => {
        sum += r.rating;
        if (r.rating >= 1 && r.rating <= 5) {
          ratingCounts[r.rating as 1 | 2 | 3 | 4 | 5]++;
        }
      });

      const totalCount = reviews.length;
      const avgRating = totalCount > 0 ? Number((sum / totalCount).toFixed(1)) : 0;

      return {
        totalCount,
        avgRating,
        ratingCounts,
        reviews: reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          isVerifiedPurchase: r.isVerifiedPurchase,
          createdAt: r.createdAt.toISOString(),
          customerName: `${r.customer.firstName} ${r.customer.lastName.charAt(0)}.`,
          avatarUrl: r.customer.avatarUrl,
        })),
      };
    } catch (err) {
      return { totalCount: 0, avgRating: 0, ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, reviews: [] };
    }
  },
};
