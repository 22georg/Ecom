import { prisma } from '@/lib/db';
import { logAdminAction } from '@/services/admin-audit.service';

export interface StockAdjustmentInput {
  inventoryItemId?: string;
  variantId?: string;
  warehouseId?: string;
  adjustmentType: 'INBOUND' | 'OUTBOUND' | 'CORRECTION' | 'RESERVATION' | 'RELEASE' | 'RETURN';
  deltaQuantity: number; // Positive or negative
  reason: string;
}

export async function getAdminInventoryLevels(search?: string) {
  if (!process.env.DATABASE_URL) return [];

  try {
    const items = await prisma.inventoryItem.findMany({
      include: {
        warehouse: true,
        variant: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    let result = items.map((i) => ({
      id: i.id,
      variantId: i.variantId,
      warehouseId: i.warehouseId,
      warehouseName: i.warehouse.name,
      warehouseCode: i.warehouse.code,
      productName: i.variant.product.name,
      productSlug: i.variant.product.slug,
      sku: i.variant.sku,
      price: Number(i.variant.price),
      quantityOnHand: i.quantityOnHand,
      quantityReserved: i.quantityReserved,
      availableQuantity: Math.max(0, i.quantityOnHand - i.quantityReserved),
      reorderThreshold: i.reorderThreshold,
      status:
        i.quantityOnHand === 0
          ? 'OUT_OF_STOCK'
          : i.quantityOnHand <= i.reorderThreshold
          ? 'LOW_STOCK'
          : 'IN_STOCK',
      updatedAt: i.updatedAt,
    }));

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (item) => item.productName.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q)
      );
    }

    return result;
  } catch (err) {
    console.error('Failed to fetch inventory levels:', err);
    return [];
  }
}

export async function adjustInventoryStock(adminUserId: string, input: StockAdjustmentInput) {
  if (!process.env.DATABASE_URL) throw new Error('Database not connected');

  let item = null;
  if (input.inventoryItemId) {
    item = await prisma.inventoryItem.findUnique({
      where: { id: input.inventoryItemId },
      include: { variant: { include: { product: true } }, warehouse: true },
    });
  } else if (input.variantId && input.warehouseId) {
    item = await prisma.inventoryItem.findUnique({
      where: {
        variantId_warehouseId: { variantId: input.variantId, warehouseId: input.warehouseId },
      },
      include: { variant: { include: { product: true } }, warehouse: true },
    });
  }

  if (!item) throw new Error('Inventory item record not found.');

  const previousQty = item.quantityOnHand;
  let newQty = previousQty;

  if (input.adjustmentType === 'INBOUND' || input.adjustmentType === 'RETURN') {
    newQty = previousQty + Math.abs(input.deltaQuantity);
  } else if (input.adjustmentType === 'OUTBOUND') {
    newQty = Math.max(0, previousQty - Math.abs(input.deltaQuantity));
  } else if (input.adjustmentType === 'CORRECTION') {
    newQty = Math.max(0, previousQty + input.deltaQuantity);
  }

  const updatedItem = await prisma.inventoryItem.update({
    where: { id: item.id },
    data: { quantityOnHand: newQty },
  });

  // Record movement entry
  const mappedMovementType = input.adjustmentType === 'CORRECTION' ? 'ADJUSTMENT' : input.adjustmentType;
  await prisma.inventoryMovement.create({
    data: {
      variantId: item.variantId,
      warehouseId: item.warehouseId,
      movementType: mappedMovementType as any,
      quantityDelta: newQty - previousQty,
      referenceType: 'MANUAL_ADJUSTMENT',
      referenceId: adminUserId,
      notes: input.reason,
    },
  });

  // Log audit entry
  await logAdminAction({
    adminUserId,
    action: 'INVENTORY_ADJUSTED',
    entityType: 'InventoryItem',
    entityId: item.id,
    payload: {
      sku: item.variant.sku,
      productName: item.variant.product.name,
      warehouse: item.warehouse.code,
      previousQty,
      newQty,
      adjustmentType: input.adjustmentType,
      reason: input.reason,
    },
  });

  return updatedItem;
}

export async function getInventoryMovementsHistory(limit: number = 50) {
  if (!process.env.DATABASE_URL) return [];

  try {
    const movements = await prisma.inventoryMovement.findMany({
      include: {
        warehouse: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const variantIds = Array.from(new Set(movements.map((m) => m.variantId)));
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    return movements.map((m) => {
      const v = variantMap.get(m.variantId);
      return {
        id: m.id,
        variantId: m.variantId,
        productName: v?.product.name || 'Unknown Product',
        sku: v?.sku || 'N/A',
        warehouseName: m.warehouse.name,
        movementType: m.movementType,
        quantityDelta: m.quantityDelta,
        referenceType: m.referenceType,
        notes: m.notes,
        createdAt: m.createdAt,
      };
    });
  } catch (err) {
    console.error('Failed to fetch inventory movements:', err);
    return [];
  }
}
