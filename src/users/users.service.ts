import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type UserView = {
  id: number;
  name: string;
  age: number;
  hkidNumber: string;
  role: Role;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number, requesterRole: Role): Promise<UserView> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, age: true, hkidNumber: true, role: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      ...user,
      hkidNumber:
        requesterRole === Role.ADMIN ? user.hkidNumber : this.maskHkid(user.hkidNumber),
    };
  }

  async list(page: number, limit: number, requesterRole: Role, q?: string) {
    const qValue = q?.trim();
    const qId = qValue && /^\d+$/.test(qValue) ? Number(qValue) : undefined;
    const where =
      qValue && qValue.length > 0
        ? {
            OR: [
              ...(typeof qId === 'number' ? [{ id: qId }] : []),
              { name: { contains: qValue } },
              { email: { contains: qValue } },
            ],
          }
        : undefined;

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
        where,
        select: { id: true, name: true, age: true, hkidNumber: true, role: true },
      }),
    ]);

    const data: UserView[] = users.map((u) => ({
      ...u,
      hkidNumber: requesterRole === Role.ADMIN ? u.hkidNumber : this.maskHkid(u.hkidNumber),
    }));

    return { total, page, limit, data };
  }

  async create(input: CreateUserDto, requesterRole: Role): Promise<UserView> {
    const passwordHash = await bcrypt.hash(input.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: input.email,
          passwordHash,
          name: input.name,
          age: input.age,
          hkidNumber: input.hkidNumber,
          role: input.role ?? Role.USER,
        },
        select: { id: true, name: true, age: true, hkidNumber: true, role: true },
      });

      return {
        ...user,
        hkidNumber:
          requesterRole === Role.ADMIN ? user.hkidNumber : this.maskHkid(user.hkidNumber),
      };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw e;
    }
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { name: true } });
    if (!user) throw new NotFoundException('User not found');
    if (user.name === 'Admin') throw new ForbiddenException('Cannot delete Admin user');

    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw e;
    }
  }

  async update(id: number, input: UpdateUserDto): Promise<UserView> {
    const data: Prisma.UserUpdateInput = {};
    if (typeof input.name === 'string') data.name = input.name;
    if (typeof input.age === 'number') data.age = input.age;
    if (typeof input.hkidNumber === 'string') data.hkidNumber = input.hkidNumber;
    if (input.role) data.role = input.role;
    if (typeof input.password === 'string' && input.password.length > 0) {
      data.passwordHash = await bcrypt.hash(input.password, 10);
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
        select: { id: true, name: true, age: true, hkidNumber: true, role: true },
      });
      return user;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw e;
    }
  }

  private maskHkid(hkid: string) {
    const first = hkid.slice(0, 1);
    const last3 = hkid.slice(-3);
    if (!first || last3.length < 3) return '****';
    return `${first}****${last3}`;
  }
}
