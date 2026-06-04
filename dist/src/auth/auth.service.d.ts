import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
}
