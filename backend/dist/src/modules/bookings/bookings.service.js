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
var BookingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let BookingsService = BookingsService_1 = class BookingsService {
    prisma;
    logger = new common_1.Logger(BookingsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        this.logger.log(`findAll${userId ? ` (userId: ${userId})` : ''}`);
        return this.prisma.booking.findMany({
            where: userId ? { userId } : undefined,
            include: {
                trip: { include: { route: true } },
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
                payment: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        this.logger.log(`findOne (id: ${id})`);
        return this.prisma.booking.findUnique({
            where: { id },
            include: {
                trip: { include: { route: true } },
                user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
                payment: true,
                tickets: true,
            },
        });
    }
    async create(data) {
        this.logger.log(`create (userId: ${data.userId}, tripId: ${data.tripId}, seats: ${data.seats})`);
        const trip = await this.prisma.trip.findUnique({
            where: { id: data.tripId },
            include: { route: true },
        });
        if (!trip) {
            throw new Error('Trip not found');
        }
        const routePrice = Number(trip.route.price);
        const totalPrice = routePrice * data.seats;
        return this.prisma.booking.create({
            data: {
                userId: data.userId,
                tripId: data.tripId,
                seats: data.seats,
                totalPrice,
                passengerName: data.passengerName,
                passengerPhone: data.passengerPhone,
                status: client_1.BookingStatus.PENDING,
            },
            include: {
                trip: { include: { route: true } },
            },
        });
    }
    async update(id, data) {
        this.logger.log(`update (id: ${id})`);
        return this.prisma.booking.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        this.logger.log(`remove (id: ${id})`);
        return this.prisma.booking.delete({
            where: { id },
        });
    }
    async getByUser(userId) {
        this.logger.log(`getByUser (userId: ${userId})`);
        return this.prisma.booking.findMany({
            where: { userId },
            include: {
                trip: { include: { route: true } },
                payment: true,
                tickets: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async confirm(id) {
        this.logger.log(`confirm (id: ${id})`);
        return this.prisma.booking.update({
            where: { id },
            data: { status: client_1.BookingStatus.CONFIRMED },
            include: {
                trip: { include: { route: true } },
                tickets: true,
            },
        });
    }
    async cancel(id) {
        this.logger.log(`cancel (id: ${id})`);
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: { payment: true },
        });
        if (!booking) {
            throw new Error('Booking not found');
        }
        if (booking.payment) {
            await this.prisma.payment.update({
                where: { bookingId: id },
                data: { status: 'REFUNDED' },
            });
        }
        return this.prisma.booking.update({
            where: { id },
            data: { status: client_1.BookingStatus.CANCELLED },
        });
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = BookingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map