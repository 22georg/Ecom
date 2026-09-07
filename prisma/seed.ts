if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/marqivo_db?schema=public';
}
import { PrismaClient } from '@prisma/client';
import { seedData } from '../src/lib/seed-data';
import { seedPDPData } from '../src/lib/seed-pdp-data';
import { seedAdminFoundation } from '../src/lib/seed-admin';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MARQIVO original database seed process...');

  // 0. Seed Admin Foundation (SuperAdmin user & RBAC)
  await seedAdminFoundation();

  // 1. Seed Categories
  for (const cat of seedData.categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        displayOrder: cat.displayOrder,
      },
    });
  }

  // 2. Seed Brands
  for (const b of seedData.brands) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, description: b.description },
      create: {
        name: b.name,
        slug: b.slug,
        description: b.description,
      },
    });
  }

  // 3. Seed Warehouses
  for (const w of seedData.warehouses) {
    await prisma.warehouse.upsert({
      where: { code: w.code },
      update: { name: w.name, address: w.address, city: w.city },
      create: {
        name: w.name,
        code: w.code,
        address: w.address,
        city: w.city,
        country: w.country,
      },
    });
  }

  // 4. Seed Rich PDP Product & Variant Data
  await seedPDPData(prisma);

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
