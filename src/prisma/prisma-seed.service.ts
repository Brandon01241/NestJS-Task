import { Injectable, OnModuleInit } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaSeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const totalUsers = await this.prisma.user.count();
    if (totalUsers > 0) return;

    await this.prisma.user.createMany({
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

    await this.prisma.user.createMany({
      data: mockUsers,
    });
  }
}
