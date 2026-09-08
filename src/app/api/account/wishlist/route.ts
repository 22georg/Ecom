import { NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/account/wishlist
 * Retrieve current customer's wishlist items
 */
export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ wishlist: [], total: 0 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ wishlist: [], total: 0 });
    }

    const userWishlist = await prisma.wishlist.findFirst({
      where: { customerId: customer.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                media: { orderBy: { displayOrder: 'asc' }, take: 1 },
                variants: { where: { isActive: true }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!userWishlist) {
      return NextResponse.json({ wishlist: [], total: 0 });
    }

    const wishlist = userWishlist.items.map((item: any) => ({
      wishlistItemId: item.id,
      productId: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      brandName: item.product.brand?.name,
      price: item.product.variants[0] ? Number(item.product.variants[0].price) : 0,
      mediaUrl: item.product.media[0]?.mediaUrl,
      addedAt: item.createdAt.toISOString(),
    }));

    return NextResponse.json({ wishlist, total: wishlist.length });
  } catch (err) {
    return NextResponse.json({ wishlist: [], total: 0 });
  }
}

/**
 * POST /api/account/wishlist
 * Toggle wishlist state (Add or Remove product)
 */
export async function POST(req: Request) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to save products to your wishlist.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ error: 'Validation Error', message: 'productId is required' }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      // In-memory fallback
      return NextResponse.json({ success: true, isSaved: true, message: 'Updated wishlist state.' });
    }

    // Get or create customer default wishlist
    let wishlist = await prisma.wishlist.findFirst({
      where: { customerId: customer.id },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          customerId: customer.id,
          name: 'Default Wishlist',
        },
      });
    }

    // Check if item already exists
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    let isSaved = false;
    if (existingItem) {
      // Remove item
      await prisma.wishlistItem.delete({
        where: { id: existingItem.id },
      });
      isSaved = false;
    } else {
      // Add item
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });
      isSaved = true;
    }

    const totalCount = await prisma.wishlistItem.count({
      where: { wishlistId: wishlist.id },
    });

    return NextResponse.json({
      success: true,
      isSaved,
      totalCount,
      message: isSaved ? 'Product saved to wishlist.' : 'Product removed from wishlist.',
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Error', message: 'Failed to update wishlist.' },
      { status: 500 }
    );
  }
}
