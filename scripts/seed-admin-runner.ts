if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/marqivo_db?schema=public';
}
import { seedAdminFoundation } from '../src/lib/seed-admin';

async function run() {
  console.log('🌱 Initializing Admin RBAC & SuperAdmin user...');
  await seedAdminFoundation();
  console.log('✅ Admin seed step completed!');
}

run().catch(console.error);
