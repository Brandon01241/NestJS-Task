"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const url = process.env.DATABASE_URL;
if (!url) {
    throw new Error('DATABASE_URL is required');
}
const adapter = new adapter_mariadb_1.PrismaMariaDb(url);
const prisma = new client_1.PrismaClient({ adapter });
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
                role: client_1.Role.ADMIN,
            },
            {
                email: 'user@example.com',
                passwordHash: await bcrypt.hash('user123', 10),
                name: 'User',
                age: 20,
                hkidNumber: 'B7654321',
                role: client_1.Role.USER,
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
            role: i % 10 === 0 ? client_1.Role.ADMIN : client_1.Role.USER,
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
//# sourceMappingURL=seed.js.map