import { NextResponse } from 'next/server';
import { CatalogService } from '@/services/catalog.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ products: [], categories: [], brands: [] });
    }

    const suggestions = await CatalogService.getSearchSuggestions(q);
    return NextResponse.json(suggestions);
  } catch (err) {
    return NextResponse.json({ products: [], categories: [], brands: [] });
  }
}
