import { Role } from '@prisma/client';
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
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: number, requesterRole: Role): Promise<UserView>;
    list(page: number, limit: number, requesterRole: Role, q?: string): Promise<{
        total: number;
        page: number;
        limit: number;
        data: UserView[];
    }>;
    create(input: CreateUserDto, requesterRole: Role): Promise<UserView>;
    remove(id: number): Promise<void>;
    update(id: number, input: UpdateUserDto): Promise<UserView>;
    private maskHkid;
}
export {};
