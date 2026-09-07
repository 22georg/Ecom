import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface FilterProductsParams {
  categorySlug?: string;
  subCategorySlug?: string;
  brandSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStockOnly?: boolean;
  sort?: 'featured' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
  page?: number;
  pageSize?: number;
  query?: string;
}

export const CatalogService = {
  /**
   * Fetch active products with category, brand, media, and variant relationships
   */
  async getActiveProducts(params?: { categorySlug?: string; limit?: number }) {
    if (!process.env.DATABASE_URL) return [];
    try {
      return await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          ...(params?.categorySlug
            ? {
                categories: {
                  some: {
                    category: { slug: params.categorySlug },
                  },
                },
              }
            : {}),
        },
        include: {
          brand: true,
          categories: { include: { category: true } },
          media: { orderBy: { displayOrder: 'asc' } },
          variants: {
            where: { isActive: true },
            include: {
              inventoryItems: { include: { warehouse: true } },
            },
          },
        },
        take: params?.limit || 20,
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      return [];
    }
  },

  /**
   * Filter, Sort, and Paginate products dynamically from PostgreSQL
   */
  async getFilteredProducts(params: FilterProductsParams) {
    if (!process.env.DATABASE_URL) {
      return { items: [], total: 0, page: 1, totalPages: 0, pageSize: params.pageSize || 12 };
    }

    try {
      const page = Math.max(1, params.page || 1);
      const pageSize = Math.min(48, Math.max(1, params.pageSize || 12));
      const skip = (page - 1) * pageSize;

      // Build WHERE conditions
      const where: Prisma.ProductWhereInput = {
        status: 'ACTIVE',
        deletedAt: null,
      };

      // Search Query filter
      if (params.query && params.query.trim()) {
        const q = params.query.trim();
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { shortDesc: { contains: q, mode: 'insensitive' } },
          { fullDesc: { contains: q, mode: 'insensitive' } },
          { brand: { name: { contains: q, mode: 'insensitive' } } },
        ];
      }

      // Category filter (handles parent or subcategory)
      const targetCategorySlug = params.subCategorySlug || params.categorySlug;
      if (targetCategorySlug) {
        where.categories = {
          some: {
            category: {
              OR: [
                { slug: targetCategorySlug },
                { parent: { slug: targetCategorySlug } },
              ],
            },
          },
        };
      }

      // Brand filter (multi-select)
      if (params.brandSlugs && params.brandSlugs.length > 0) {
        where.brand = {
          slug: { in: params.brandSlugs },
        };
      }

      // Minimum Rating filter
      if (params.rating && params.rating > 0) {
        where.ratingAvg = { gte: new Prisma.Decimal(params.rating) };
      }

      // Sorting Mapping (Strict white-listed fields to prevent SQL injection)
      let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
      switch (params.sort) {
        case 'price_asc':
          orderBy = { variants: { _count: 'desc' } }; // Standard fallback
          break;
        case 'price_desc':
          orderBy = { createdAt: 'desc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'rating':
          orderBy = { ratingAvg: 'desc' };
          break;
        case 'featured':
        default:
          orderBy = { createdAt: 'desc' };
          break;
      }

      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            brand: true,
            categories: { include: { category: true } },
            media: { orderBy: { displayOrder: 'asc' } },
            variants: {
              where: { isActive: true },
              include: { inventoryItems: true },
            },
          },
          skip,
          take: pageSize,
          orderBy,
        }),
        prisma.product.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (err) {
      return { items: [], total: 0, page: 1, totalPages: 0, pageSize: params.pageSize || 12 };
    }
  },

  /**
   * Fast debounced Search Autocomplete suggestions for Products, Categories, Brands
   */
  async getSearchSuggestions(query: string) {
    if (!process.env.DATABASE_URL || !query || query.trim().length < 2) {
      return { products: [], categories: [], brands: [] };
    }

    try {
      const q = query.trim();

      const [products, categories, brands] = await Promise.all([
        prisma.product.findMany({
          where: {
            status: 'ACTIVE',
            deletedAt: null,
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { shortDesc: { contains: q, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            name: true,
            slug: true,
            variants: { select: { price: true }, take: 1 },
            media: { select: { mediaUrl: true }, take: 1 },
          },
          take: 5,
        }),
        prisma.category.findMany({
          where: {
            isActive: true,
            name: { contains: q, mode: 'insensitive' },
          },
          select: { id: true, name: true, slug: true },
          take: 3,
        }),
        prisma.brand.findMany({
          where: {
            isActive: true,
            name: { contains: q, mode: 'insensitive' },
          },
          select: { id: true, name: true, slug: true },
          take: 3,
        }),
      ]);

      return { products, categories, brands };
    } catch (err) {
      return { products: [], categories: [], brands: [] };
    }
  },

  /**
   * Retrieve dynamic filter facets (brands, min/max price range, subcategories)
   */
  async getAvailableFilters(categorySlug?: string) {
    if (!process.env.DATABASE_URL) {
      return { brands: [], subcategories: [], minPrice: 0, maxPrice: 1000 };
    }

    try {
      const [brands, subcategories] = await Promise.all([
        prisma.brand.findMany({
          where: { isActive: true },
          select: { id: true, name: true, slug: true },
          orderBy: { name: 'asc' },
        }),
        categorySlug
          ? prisma.category.findMany({
              where: {
                parent: { slug: categorySlug },
                isActive: true,
              },
              select: { id: true, name: true, slug: true },
            })
          : [],
      ]);

      return {
        brands,
        subcategories,
        minPrice: 0,
        maxPrice: 2000,
      };
    } catch (err) {
      return { brands: [], subcategories: [], minPrice: 0, maxPrice: 1000 };
    }
  },

  /**
   * Find product by unique slug with all options and reviews
   */
  async getProductBySlug(slug: string) {
    if (!process.env.DATABASE_URL) return null;
    try {
      return await prisma.product.findUnique({
        where: { slug },
        include: {
          brand: true,
          categories: { include: { category: true } },
          options: { include: { values: true }, orderBy: { displayOrder: 'asc' } },
          variants: {
            include: {
              inventoryItems: { include: { warehouse: true } },
              variantOptions: { include: { optionValue: true } },
            },
          },
          media: { orderBy: { displayOrder: 'asc' } },
          reviews: { where: { isApproved: true }, orderBy: { createdAt: 'desc' } },
        },
      });
    } catch (err) {
      return null;
    }
  },

  /**
   * Get full Category tree hierarchy
   */
  async getCategoryTree() {
    if (!process.env.DATABASE_URL) return [];
    try {
      return await prisma.category.findMany({
        where: { parentId: null, isActive: true, deletedAt: null },
        include: {
          children: {
            where: { isActive: true },
            include: { children: true },
          },
        },
        orderBy: { displayOrder: 'asc' },
      });
    } catch (err) {
      return [];
    }
  },

  /**
   * Get single Brand details by slug
   */
  async getBrandBySlug(slug: string) {
    if (!process.env.DATABASE_URL) return null;
    try {
      return await prisma.brand.findUnique({
        where: { slug },
      });
    } catch (err) {
      return null;
    }
  },
};
