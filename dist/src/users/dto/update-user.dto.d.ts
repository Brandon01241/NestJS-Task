import { Role } from '@prisma/client';
export declare class UpdateUserDto {
    name?: string;
    age?: number;
    hkidNumber?: string;
    role?: Role;
    password?: string;
}
