import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/auth';
import { ReviewService } from '@/services/review.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ success: false, message: 'Missing productId parameter' }, { status: 400 });
    }

    const reviewsData = await ReviewService.getProductReviews(productId);
    return NextResponse.json({
      success: true,
      data: reviewsData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Please log in to leave a review.' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, title, comment, orderItemId } = body;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid rating (1-5 stars) and product.' },
        { status: 400 }
      );
    }

    const review = await ReviewService.submitReview(customer.id, {
      productId,
      orderItemId,
      rating: Number(rating),
      title,
      comment,
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your review has been submitted.',
      data: review,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to submit review' },
      { status: 400 }
    );
  }
}
