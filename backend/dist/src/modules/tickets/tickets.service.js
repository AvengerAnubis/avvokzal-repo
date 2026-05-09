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
var TicketsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto_1 = require("crypto");
let TicketsService = TicketsService_1 = class TicketsService {
    prisma;
    logger = new common_1.Logger(TicketsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        this.logger.log(`findAll${userId ? ` (userId: ${userId})` : ''}`);
        const where = userId ? { booking: { userId } } : {};
        return this.prisma.ticket.findMany({
            where,
            include: { booking: true, trip: { include: { route: true } } },
        });
    }
    async findOne(id) {
        this.logger.log(`findOne (id: ${id})`);
        return this.prisma.ticket.findUnique({
            where: { id },
            include: { booking: true, trip: { include: { route: true } } },
        });
    }
    async findByBooking(bookingId) {
        this.logger.log(`findByBooking (bookingId: ${bookingId})`);
        return this.prisma.ticket.findMany({
            where: { bookingId },
            include: { trip: { include: { route: true } } },
        });
    }
    async create(data) {
        this.logger.log(`create (bookingId: ${data.bookingId}, tripId: ${data.tripId}, seat: ${data.seatNumber})`);
        const qrCode = `TICKET-${(0, crypto_1.randomBytes)(16).toString('hex')}`;
        return this.prisma.ticket.create({
            data: {
                ...data,
                qrCode,
            },
            include: { trip: { include: { route: true } } },
        });
    }
    async markAsUsed(id) {
        this.logger.log(`markAsUsed (id: ${id})`);
        return this.prisma.ticket.update({
            where: { id },
            data: { isUsed: true, usedAt: new Date() },
        });
    }
    async validate(id) {
        this.logger.log(`validate (id: ${id})`);
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
            include: { trip: true },
        });
        if (!ticket) {
            return { valid: false, error: 'Билет не найден' };
        }
        if (ticket.isUsed) {
            return { valid: false, error: 'Билет уже использован' };
        }
        return { valid: true, ticket };
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = TicketsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map