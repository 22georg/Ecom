import { prisma } from '@/lib/db';
import { logAdminAction } from '@/services/admin-audit.service';

export interface AdminProductFilterOptions {
  search?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface CreateProductInput {
  name: string;
  slug: string;
  shortDesc?: string;
  fullDesc?: string;
  brandId?: string;
  categoryId?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  type?: 'PHYSICAL' | 'DIGITAL';
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  stockQuantity: number;
  mediaUrls?: string[];
}

export async function getAdminProducts(options: AdminProductFilterOptions = {}) {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;

  if (!process.env.DATABASE_URL) {
    return { products: [], total: 0, page, limit, totalPages: 0 };
  }

  try {
    const where: any = {};

    if (options.status) {
      where.status = options.status;
    } else {
      where.status = { in: ['DRAFT', 'ACTIVE', 'ARCHIVED'] };
    }

    if (options.categoryId) {
      where.categories = {
        some: { categoryId: options.categoryId },
      };
    }

    if (options.search && options.search.trim()) {
      const q = options.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        {
          variants: {
            some: { sku: { contains: q, mode: 'insensitive' } },
          },
        },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          categories: { include: { category: true } },
          media: { orderBy: { displayOrder: 'asc' } },
          variants: {
            include: { inventoryItems: { include: { warehouse: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map((p) => {
        const primaryMedia = p.media.find((m) => m.isPrimary) || p.media[0];
        const defaultVariant = p.variants[0];
        const totalStock = p.variants.reduce((acc, v) => {
          return acc + v.inventoryItems.reduce((invAcc, i) => invAcc + i.quantityOnHand, 0);
        }, 0);

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          shortDesc: p.shortDesc,
          status: p.status,
          type: p.type,
          ratingAvg: Number(p.ratingAvg),
          reviewCount: p.reviewCount,
          primaryImage: primaryMedia?.mediaUrl || null,
          brandName: p.brand?.name || null,
          categories: p.categories.map((c) => c.category.name),
          variantCount: p.variants.length,
          price: defaultVariant ? Number(defaultVariant.price) : 0,
          compareAtPrice: defaultVariant?.compareAtPrice ? Number(defaultVariant.compareAtPrice) : null,
          sku: defaultVariant?.sku || 'N/A',
          totalStock,
          createdAt: p.createdAt,
        };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.error('Failed to fetch admin products:', err);
    return { products: [], total: 0, page, limit, totalPages: 0 };
  }
}

export async function createAdminProduct(adminUserId: string, input: CreateProductInput) {
  if (!process.env.DATABASE_URL) throw new Error('Database not connected');

  // Check unique slug & SKU
  const existingSlug = await prisma.product.findUnique({ where: { slug: input.slug } });
  if (existingSlug) throw new Error(`Product slug "${input.slug}" already exists.`);

  const existingSku = await prisma.productVariant.findUnique({ where: { sku: input.sku } });
  if (existingSku) throw new Error(`SKU "${input.sku}" already exists.`);

  const defaultWarehouse = await prisma.warehouse.findFirst();
  if (!defaultWarehouse) throw new Error('No default warehouse configured for stock creation.');

  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug: input.slug,
      shortDesc: input.shortDesc || null,
      fullDesc: input.fullDesc || null,
      brandId: input.brandId || null,
      status: input.status || 'DRAFT',
      type: input.type || 'PHYSICAL',
      publishedAt: input.status === 'ACTIVE' ? new Date() : null,
      ...(input.categoryId
        ? {
            categories: {
              create: [{ categoryId: input.categoryId }],
            },
          }
        : {}),
      media: {
        create: (input.mediaUrls || []).map((url, index) => ({
          mediaUrl: url,
          isPrimary: index === 0,
          displayOrder: index,
        })),
      },
      variants: {
        create: [
          {
            sku: input.sku,
            price: input.price,
            compareAtPrice: input.compareAtPrice || null,
            costPrice: input.costPrice || null,
            inventoryItems: {
              create: [
                {
                  warehouseId: defaultWarehouse.id,
                  quantityOnHand: input.stockQuantity,
                  reorderThreshold: 5,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await logAdminAction({
    adminUserId,
    action: 'PRODUCT_CREATED',
    entityType: 'Product',
    entityId: product.id,
    payload: { name: product.name, sku: input.sku, price: input.price, status: product.status },
  });

  return product;
}

export async function updateAdminProductStatus(
  adminUserId: string,
  productId: string,
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
) {
  if (!process.env.DATABASE_URL) throw new Error('Database not connected');

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      status,
      publishedAt: status === 'ACTIVE' ? new Date() : undefined,
    },
  });

  await logAdminAction({
    adminUserId,
    action: 'PRODUCT_STATUS_UPDATED',
    entityType: 'Product',
    entityId: productId,
    payload: { newStatus: status },
  });

  return updated;
}

export async function getAdminCategoriesTree() {
  if (!process.env.DATABASE_URL) return [];

  try {
    const categories = await prisma.category.findMany({
      include: {
        children: {
          include: { children: true },
        },
        _count: { select: { products: true } },
      },
      orderBy: { displayOrder: 'asc' },
    });

    const rootCategories = categories.filter((c) => c.parentId === null);
    return rootCategories.map((root) => ({
      id: root.id,
      name: root.name,
      slug: root.slug,
      description: root.description,
      displayOrder: root.displayOrder,
      isActive: root.isActive,
      productCount: root._count.products,
      children: root.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        description: child.description,
        displayOrder: child.displayOrder,
        isActive: child.isActive,
        productCount: 0,
      })),
    }));
  } catch (err) {
    console.error('Failed to fetch categories tree:', err);
    return [];
  }
}
