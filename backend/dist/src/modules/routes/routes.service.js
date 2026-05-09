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
var RoutesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RoutesService = RoutesService_1 = class RoutesService {
    prisma;
    logger = new common_1.Logger(RoutesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        this.logger.log('findAll');
        return this.prisma.route.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        this.logger.log(`findOne (id: ${id})`);
        return this.prisma.route.findUnique({
            where: { id },
            include: { trips: true },
        });
    }
    async create(data) {
        this.logger.log(`create (${data.origin} → ${data.destination})`);
        return this.prisma.route.create({
            data: {
                ...data,
                isActive: true,
            },
        });
    }
    async update(id, data) {
        this.logger.log(`update (id: ${id})`);
        return this.prisma.route.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        this.logger.log(`remove (id: ${id}) [soft delete]`);
        return this.prisma.route.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async search(origin, destination) {
        this.logger.log(`search (${origin} → ${destination})`);
        return this.prisma.route.findMany({
            where: {
                isActive: true,
                OR: [
                    { origin: { contains: origin, mode: 'insensitive' } },
                    { destination: { contains: destination, mode: 'insensitive' } },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.RoutesService = RoutesService;
exports.RoutesService = RoutesService = RoutesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoutesService);
//# sourceMappingURL=routes.service.js.map