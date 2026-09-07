import { prisma } from '@/lib/db';
import { MovementType } from '@prisma/client';

export const InventoryService = {
  /**
   * Adjust inventory stock and log auditable movement record
   */
  async recordMovement(params: {
    variantId: string;
    warehouseId: string;
    movementType: MovementType;
    quantityDelta: number;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Log Movement
      const movement = await tx.inventoryMovement.create({
        data: {
          variantId: params.variantId,
          warehouseId: params.warehouseId,
          movementType: params.movementType,
          quantityDelta: params.quantityDelta,
          referenceType: params.referenceType,
          referenceId: params.referenceId,
          notes: params.notes,
        },
      });

      // 2. Update Inventory Item
      const inventory = await tx.inventoryItem.upsert({
        where: {
          variantId_warehouseId: {
            variantId: params.variantId,
            warehouseId: params.warehouseId,
          },
        },
        create: {
          variantId: params.variantId,
          warehouseId: params.warehouseId,
          quantityOnHand: Math.max(0, params.quantityDelta),
        },
        update: {
          quantityOnHand: {
            increment: params.quantityDelta,
          },
        },
      });

      return { movement, inventory };
    });
  },

  /**
   * Query total available stock for a product variant across all active warehouses
   */
  async getVariantStock(variantId: string) {
    try {
      const items = await prisma.inventoryItem.findMany({
        where: { variantId },
        include: { warehouse: true },
      });

      const totalOnHand = items.reduce((acc, item) => acc + item.quantityOnHand, 0);
      const totalReserved = items.reduce((acc, item) => acc + item.quantityReserved, 0);

      return {
        variantId,
        totalOnHand,
        totalReserved,
        availableStock: Math.max(0, totalOnHand - totalReserved),
        warehouses: items,
      };
    } catch (err) {
      return { variantId, totalOnHand: 0, totalReserved: 0, availableStock: 0, warehouses: [] };
    }
  },
};
