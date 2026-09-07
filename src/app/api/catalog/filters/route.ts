import { NextResponse } from 'next/server';
import { CatalogService } from '@/services/catalog.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category') || undefined;

    const filters = await CatalogService.getAvailableFilters(categorySlug);
    return NextResponse.json(filters);
  } catch (err) {
    return NextResponse.json({ brands: [], subcategories: [], minPrice: 0, maxPrice: 1000 });
  }
}
