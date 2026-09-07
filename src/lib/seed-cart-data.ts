import { PrismaClient, DiscountType } from '@prisma/client';

export async function seedCartData(prisma: PrismaClient) {
  console.log('🎟️ Seeding MARQIVO coupon engine & promo codes...');

  await prisma.coupon.upsert({
    where: { code: 'MARQIVO10' },
    update: {
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10.0,
      isActive: true,
    },
    create: {
      code: 'MARQIVO10',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10.0,
      minOrderValue: 0.0,
      maxDiscount: 5000.0,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'WELCOME1000' },
    update: {
      discountType: DiscountType.FIXED,
      discountValue: 1000.0,
      minOrderValue: 10000.0,
      isActive: true,
    },
    create: {
      code: 'WELCOME1000',
      discountType: DiscountType.FIXED,
      discountValue: 1000.0,
      minOrderValue: 10000.0,
      isActive: true,
    },
  });

  console.log('✅ Cart seed completed!');
}
