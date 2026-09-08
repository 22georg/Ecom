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

export async function getAdminProductById(productId: string) {
  if (!process.env.DATABASE_URL) return null;

  const p = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      brand: true,
      categories: { include: { category: true } },
      media: { orderBy: { displayOrder: 'asc' } },
      variants: {
        include: { inventoryItems: { include: { warehouse: true } } },
      },
    },
  });

  if (!p) return null;

  const defaultVariant = p.variants[0];
  const totalStock = p.variants.reduce((acc, v) => {
    return acc + v.inventoryItems.reduce((invAcc, i) => invAcc + i.quantityOnHand, 0);
  }, 0);

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDesc: p.shortDesc || '',
    fullDesc: p.fullDesc || '',
    status: p.status,
    type: p.type,
    brandId: p.brandId || '',
    categoryId: p.categories[0]?.categoryId || '',
    categoryName: p.categories[0]?.category.name || '',
    price: defaultVariant ? Number(defaultVariant.price) : 0,
    compareAtPrice: defaultVariant?.compareAtPrice ? Number(defaultVariant.compareAtPrice) : null,
    sku: defaultVariant?.sku || '',
    stockQuantity: totalStock,
    mediaUrls: p.media.map((m) => m.mediaUrl),
    primaryImage: p.media.find((m) => m.isPrimary)?.mediaUrl || p.media[0]?.mediaUrl || null,
  };
}

export async function updateAdminProduct(adminUserId: string, productId: string, input: Partial<CreateProductInput>) {
  if (!process.env.DATABASE_URL) throw new Error('Database not connected');

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!existing) throw new Error('Product not found.');

  // Validate slug uniqueness if changed
  if (input.slug && input.slug !== existing.slug) {
    const slugCheck = await prisma.product.findUnique({ where: { slug: input.slug } });
    if (slugCheck) throw new Error(`Slug "${input.slug}" is already in use by another product.`);
  }

  // Validate SKU uniqueness if changed
  if (input.sku && existing.variants[0] && input.sku !== existing.variants[0].sku) {
    const skuCheck = await prisma.productVariant.findUnique({ where: { sku: input.sku } });
    if (skuCheck) throw new Error(`SKU "${input.sku}" is already in use.`);
  }

  // Update base product
  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.slug ? { slug: input.slug } : {}),
      shortDesc: input.shortDesc !== undefined ? input.shortDesc : existing.shortDesc,
      fullDesc: input.fullDesc !== undefined ? input.fullDesc : existing.fullDesc,
      status: input.status || existing.status,
      type: input.type || existing.type,
      publishedAt: input.status === 'ACTIVE' ? new Date() : existing.publishedAt,
    },
  });

  // Update primary variant (price, compareAtPrice, SKU, stock)
  const defaultVariant = existing.variants[0];
  if (defaultVariant) {
    await prisma.productVariant.update({
      where: { id: defaultVariant.id },
      data: {
        ...(input.price !== undefined ? { price: input.price } : {}),
        compareAtPrice: input.compareAtPrice !== undefined ? input.compareAtPrice : defaultVariant.compareAtPrice,
        ...(input.sku ? { sku: input.sku } : {}),
      },
    });

    if (input.stockQuantity !== undefined) {
      const invItem = await prisma.inventoryItem.findFirst({
        where: { variantId: defaultVariant.id },
      });

      if (invItem) {
        await prisma.inventoryItem.update({
          where: { id: invItem.id },
          data: { quantityOnHand: input.stockQuantity },
        });
      }
    }
  }

  // Update Category mapping if provided
  if (input.categoryId !== undefined) {
    await prisma.productCategory.deleteMany({ where: { productId } });
    if (input.categoryId) {
      await prisma.productCategory.create({
        data: { productId, categoryId: input.categoryId },
      });
    }
  }

  // Update Media URLs if provided
  if (input.mediaUrls !== undefined && input.mediaUrls.length > 0) {
    await prisma.productMedia.deleteMany({ where: { productId } });
    await prisma.productMedia.createMany({
      data: input.mediaUrls.map((url, idx) => ({
        productId,
        mediaUrl: url,
        isPrimary: idx === 0,
        displayOrder: idx,
      })),
    });
  }

  await logAdminAction({
    adminUserId,
    action: 'PRODUCT_UPDATED',
    entityType: 'Product',
    entityId: productId,
    payload: { name: updatedProduct.name, status: updatedProduct.status },
  });

  return updatedProduct;
}

export async function deleteAdminProduct(adminUserId: string, productId: string) {
  if (!process.env.DATABASE_URL) throw new Error('Database not connected');

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) throw new Error('Product not found.');

  // Clean up child relations manually to avoid FK constraints
  const variants = await prisma.productVariant.findMany({ where: { productId }, select: { id: true } });
  const variantIds = variants.map((v) => v.id);

  if (variantIds.length > 0) {
    await prisma.inventoryItem.deleteMany({ where: { variantId: { in: variantIds } } });
    await prisma.productVariantOption.deleteMany({ where: { variantId: { in: variantIds } } });
    await prisma.productVariant.deleteMany({ where: { productId } });
  }

  await prisma.productCategory.deleteMany({ where: { productId } });
  await prisma.productMedia.deleteMany({ where: { productId } });
  await prisma.productReview.deleteMany({ where: { productId } });

  const deleted = await prisma.product.delete({ where: { id: productId } });

  await logAdminAction({
    adminUserId,
    action: 'PRODUCT_DELETED',
    entityType: 'Product',
    entityId: productId,
    payload: { name: existing.name },
  });

  return deleted;
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

export async function updateAdminCategory(
  adminUserId: string,
  categoryId: string,
  input: { name?: string; slug?: string; description?: string; parentId?: string; isActive?: boolean }
) {
  if (!process.env.DATABASE_URL) throw new Error('Database not connected');

  const existing = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!existing) throw new Error('Category not found.');

  if (input.slug && input.slug !== existing.slug) {
    const slugCheck = await prisma.category.findUnique({ where: { slug: input.slug } });
    if (slugCheck) throw new Error(`Category slug "${input.slug}" is already in use.`);
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.slug ? { slug: input.slug } : {}),
      description: input.description !== undefined ? input.description : existing.description,
      parentId: input.parentId !== undefined ? (input.parentId || null) : existing.parentId,
      isActive: input.isActive !== undefined ? input.isActive : existing.isActive,
    },
  });

  await logAdminAction({
    adminUserId,
    action: 'CATEGORY_UPDATED',
    entityType: 'Category',
    entityId: categoryId,
    payload: { name: updated.name, slug: updated.slug },
  });

  return updated;
}

export async function deleteAdminCategory(adminUserId: string, categoryId: string) {
  if (!process.env.DATABASE_URL) throw new Error('Database not connected');

  const existing = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!existing) throw new Error('Category not found.');

  // Disconnect products assigned to this category
  await prisma.productCategory.deleteMany({ where: { categoryId } });

  // Update children parentId to null if any
  await prisma.category.updateMany({
    where: { parentId: categoryId },
    data: { parentId: null },
  });

  const deleted = await prisma.category.delete({ where: { id: categoryId } });

  await logAdminAction({
    adminUserId,
    action: 'CATEGORY_DELETED',
    entityType: 'Category',
    entityId: categoryId,
    payload: { name: existing.name },
  });

  return deleted;
}

