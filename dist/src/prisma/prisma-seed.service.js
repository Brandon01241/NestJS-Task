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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaSeedService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("./prisma.service");
let PrismaSeedService = class PrismaSeedService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        const totalUsers = await this.prisma.user.count();
        if (totalUsers > 0)
            return;
        await this.prisma.user.createMany({
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
        await this.prisma.user.createMany({
            data: mockUsers,
        });
    }
};
exports.PrismaSeedService = PrismaSeedService;
exports.PrismaSeedService = PrismaSeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaSeedService);
//# sourceMappingURL=prisma-seed.service.js.map