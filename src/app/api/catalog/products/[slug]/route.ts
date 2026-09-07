import { NextResponse } from 'next/server';
import { ProductDetailService } from '@/services/product-detail.service';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { slug: string };
}

/**
 * GET /api/catalog/products/[slug]
 * Returns customer-safe public product detail payload or 404 if not found/inactive.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const slug = params.slug;
    if (!slug) {
      return NextResponse.json({ error: 'Not Found', message: 'Product slug required' }, { status: 400 });
    }

    const productDetail = await ProductDetailService.getProductDetailBySlug(slug);

    if (!productDetail) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Product does not exist or is currently unavailable.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product: productDetail });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Error', message: 'Failed to retrieve product details.' },
      { status: 500 }
    );
  }
}
