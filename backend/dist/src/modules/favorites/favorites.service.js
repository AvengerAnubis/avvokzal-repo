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
var FavoritesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoritesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FavoritesService = FavoritesService_1 = class FavoritesService {
    prisma;
    logger = new common_1.Logger(FavoritesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        this.logger.log(`findAll (userId: ${userId})`);
        return this.prisma.favorite.findMany({
            where: { userId },
            include: { route: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async add(userId, routeId) {
        this.logger.log(`add (userId: ${userId}, routeId: ${routeId})`);
        const existing = await this.prisma.favorite.findUnique({
            where: { userId_routeId: { userId, routeId } },
        });
        if (existing) {
            return existing;
        }
        return this.prisma.favorite.create({
            data: { userId, routeId },
            include: { route: true },
        });
    }
    async remove(userId, routeId) {
        this.logger.log(`remove (userId: ${userId}, routeId: ${routeId})`);
        return this.prisma.favorite.delete({
            where: { userId_routeId: { userId, routeId } },
        });
    }
    async isFavorite(userId, routeId) {
        this.logger.log(`isFavorite (userId: ${userId}, routeId: ${routeId})`);
        const favorite = await this.prisma.favorite.findUnique({
            where: { userId_routeId: { userId, routeId } },
        });
        return { isFavorite: !!favorite };
    }
};
exports.FavoritesService = FavoritesService;
exports.FavoritesService = FavoritesService = FavoritesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FavoritesService);
//# sourceMappingURL=favorites.service.js.map