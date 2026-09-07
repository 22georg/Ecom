const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/marqivo_db?schema=public';
const prisma = new PrismaClient();

async function seedAdmin() {
  console.log('🌱 Seeding SuperAdmin user...');
  const email = 'admin@marqivo.com';
  const rawPassword = 'MarqivoAdmin2026!';
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  // 1. Upsert SuperAdmin Role
  const role = await prisma.adminRole.upsert({
    where: { name: 'SuperAdmin' },
    update: { description: 'Full administrative control' },
    create: { name: 'SuperAdmin', description: 'Full administrative control' },
  });

  // 2. Upsert Admin User
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {
      name: 'MARQIVO Lead Administrator',
      passwordHash,
      isActive: true,
    },
    create: {
      email,
      name: 'MARQIVO Lead Administrator',
      passwordHash,
      isActive: true,
    },
  });

  // 3. Link Role
  await prisma.adminRoleUser.upsert({
    where: {
      adminUserId_roleId: {
        adminUserId: admin.id,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      adminUserId: admin.id,
      roleId: role.id,
    },
  });

  console.log('✅ SuperAdmin User successfully updated!');
  console.log('Email:', email);
  console.log('Password:', rawPassword);
  console.log('Hashed Password:', passwordHash.substring(0, 15) + '...');
}

seedAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
