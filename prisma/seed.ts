import { PrismaClient, Role } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is required');
}

const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');
  const totalUsers = await prisma.user.count();
  if (totalUsers > 0) {
    console.log('Database already seeded.');
    return;
  }

  await prisma.user.createMany({
    data: [
      {
        email: 'admin@example.com',
        passwordHash: await bcrypt.hash('admin123', 10),
        name: 'Admin',
        age: 30,
        hkidNumber: 'A1234123',
        role: Role.ADMIN,
      },
      {
        email: 'user@example.com',
        passwordHash: await bcrypt.hash('user123', 10),
        name: 'User',
        age: 20,
        hkidNumber: 'B7654321',
        role: Role.USER,
      },
    ],
  });

  const mockUsers = [];
  for (let i = 1; i <= 48; i++) {
    mockUsers.push({
      email: `mockuser${i}@example.com`,
      passwordHash: await bcrypt.hash('password123', 10),
      name: `Mock User ${i}`,
      age: 18 + (i % 40),
      hkidNumber: `C${1000000 + i}`,
      role: i % 10 === 0 ? Role.ADMIN : Role.USER,
    });
  }

  await prisma.user.createMany({
    data: mockUsers,
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
