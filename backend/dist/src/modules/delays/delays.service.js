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
var DelaysService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelaysService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DelaysService = DelaysService_1 = class DelaysService {
    prisma;
    logger = new common_1.Logger(DelaysService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tripId) {
        this.logger.log(`findAll${tripId ? ` (tripId: ${tripId})` : ''}`);
        return this.prisma.delay.findMany({
            where: tripId ? { tripId } : undefined,
            include: { trip: { include: { route: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        this.logger.log(`findOne (id: ${id})`);
        return this.prisma.delay.findUnique({
            where: { id },
            include: { trip: { include: { route: true } } },
        });
    }
    async create(data) {
        this.logger.log(`create (tripId: ${data.tripId}, delay: ${data.delayMinutes}min)`);
        await this.prisma.trip.update({
            where: { id: data.tripId },
            data: { status: client_1.TripStatus.DELAYED },
        });
        return this.prisma.delay.create({
            data,
            include: { trip: { include: { route: true } } },
        });
    }
    async getByTrip(tripId) {
        this.logger.log(`getByTrip (tripId: ${tripId})`);
        return this.prisma.delay.findMany({
            where: { tripId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getAllWithTrips() {
        this.logger.log('getAllWithTrips');
        return this.prisma.delay.findMany({
            include: { trip: { include: { route: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.DelaysService = DelaysService;
exports.DelaysService = DelaysService = DelaysService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DelaysService);
//# sourceMappingURL=delays.service.js.map