"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt = require("bcryptjs");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor() {
        const pool = new pg_1.Pool({
            connectionString: process.env.DATABASE_URL,
        });
        const adapter = new adapter_pg_1.PrismaPg(pool);
        super({ adapter });
    }
    async onModuleInit() {
        await this.$connect();
        await this.seedAdminUser();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
    async seedAdminUser() {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) {
            console.log('Admin credentials not configured in .env');
            return;
        }
        try {
            const existingAdmin = await this.user.findUnique({
                where: { email: adminEmail },
            });
            if (existingAdmin) {
                console.log('Admin user already exists');
                return;
            }
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await this.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    firstName: 'Админ',
                    lastName: 'Системы',
                    role: 'ADMIN',
                    isActive: true,
                },
            });
            console.log(`Admin user created: ${adminEmail}`);
        }
        catch (error) {
            console.error('Error seeding admin user:', error);
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map