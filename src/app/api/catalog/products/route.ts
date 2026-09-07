import { NextResponse } from 'next/server';
import { CatalogService } from '@/services/catalog.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q') || undefined;
    const categorySlug = searchParams.get('category') || undefined;
    const subCategorySlug = searchParams.get('subCategory') || undefined;
    const brandParam = searchParams.get('brand');
    const brandSlugs = brandParam ? brandParam.split(',').filter(Boolean) : undefined;

    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const rating = searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined;

    const sort = (searchParams.get('sort') as any) || 'featured';
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 12;

    const result = await CatalogService.getFilteredProducts({
      query,
      categorySlug,
      subCategorySlug,
      brandSlugs,
      minPrice,
      maxPrice,
      rating,
      sort,
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch catalog products' }, { status: 500 });
  }
}
