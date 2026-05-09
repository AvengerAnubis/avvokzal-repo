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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
let UsersService = UsersService_1 = class UsersService {
    prisma;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(role) {
        this.logger.log(`findAll${role ? ` (role: ${role})` : ''}`);
        return this.prisma.user.findMany({
            where: role ? { role } : undefined,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        this.logger.log(`findOne (id: ${id})`);
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async create(data) {
        this.logger.log(`create (email: ${data.email}, role: ${data.role || 'USER'})`);
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                role: data.role || client_1.UserRole.USER,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
    }
    async update(id, data) {
        this.logger.log(`update (id: ${id})`);
        return this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                isActive: true,
                updatedAt: true,
            },
        });
    }
    async remove(id) {
        this.logger.log(`remove (id: ${id}) [soft delete]`);
        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async getDrivers() {
        this.logger.log('getDrivers');
        return this.prisma.user.findMany({
            where: { role: client_1.UserRole.DRIVER, isActive: true },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
            },
        });
    }
    async getOperators() {
        this.logger.log('getOperators');
        return this.prisma.user.findMany({
            where: { role: client_1.UserRole.OPERATOR, isActive: true },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
            },
        });
    }
    async getAdmins() {
        this.logger.log('getAdmins');
        return this.prisma.user.findMany({
            where: { role: client_1.UserRole.ADMIN, isActive: true },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
            },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map