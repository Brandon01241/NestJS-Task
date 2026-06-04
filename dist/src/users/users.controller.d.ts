import { Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UsersService } from './users.service';
type AuthenticatedRequest = {
    user: {
        userId: number;
        role: Role;
    };
};
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    list(query: PaginationQueryDto, req: AuthenticatedRequest): Promise<{
        total: number;
        page: number;
        limit: number;
        data: {
            id: number;
            name: string;
            age: number;
            hkidNumber: string;
            role: Role;
        }[];
    }>;
    getById(id: number, req: AuthenticatedRequest): Promise<{
        total: number;
        page: number;
        limit: number;
        data: {
            id: number;
            name: string;
            age: number;
            hkidNumber: string;
            role: Role;
        }[];
    }>;
    create(body: CreateUserDto, req: AuthenticatedRequest): Promise<{
        total: number;
        page: number;
        limit: number;
        data: {
            id: number;
            name: string;
            age: number;
            hkidNumber: string;
            role: Role;
        }[];
    }>;
    remove(id: number): Promise<{
        ok: boolean;
    }>;
    update(id: number, body: UpdateUserDto): Promise<{
        total: number;
        page: number;
        limit: number;
        data: {
            id: number;
            name: string;
            age: number;
            hkidNumber: string;
            role: Role;
        }[];
    }>;
}
export {};
