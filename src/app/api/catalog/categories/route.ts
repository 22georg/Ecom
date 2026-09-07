import { NextResponse } from 'next/server';
import { CatalogService } from '@/services/catalog.service';
import { getCached, setCached } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cacheKey = 'catalog_category_tree';
    const cached = getCached<any[]>(cacheKey);
    if (cached) {
      return NextResponse.json({ categories: cached });
    }

    const categories = await CatalogService.getCategoryTree();
    setCached(cacheKey, categories, 15000);
    return NextResponse.json({ categories });
  } catch (err) {
    return NextResponse.json({ categories: [] });
  }
}
