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
var TripsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TripsService = TripsService_1 = class TripsService {
    prisma;
    logger = new common_1.Logger(TripsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByRoute(routeId) {
        this.logger.log(`findByRoute (routeId: ${routeId})`);
        return this.prisma.trip.findMany({
            where: { routeId },
            include: {
                route: true,
                driver: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
            orderBy: { departureTime: 'asc' },
        });
    }
    async findAll(routeId) {
        this.logger.log(`findAll${routeId ? ` (routeId: ${routeId})` : ''}`);
        return this.prisma.trip.findMany({
            where: routeId ? { routeId } : undefined,
            include: {
                route: true,
                driver: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
            orderBy: { departureTime: 'asc' },
        });
    }
    async findOne(id) {
        this.logger.log(`findOne (id: ${id})`);
        return this.prisma.trip.findUnique({
            where: { id },
            include: {
                route: true,
                driver: {
                    select: { id: true, firstName: true, lastName: true },
                },
                bookings: {
                    include: { user: true },
                },
            },
        });
    }
    async create(data) {
        this.logger.log(`create (routeId: ${data.routeId})`);
        return this.prisma.trip.create({
            data,
            include: { route: true },
        });
    }
    async update(id, data) {
        this.logger.log(`update (id: ${id})`);
        return this.prisma.trip.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        this.logger.log(`remove (id: ${id})`);
        return this.prisma.trip.delete({
            where: { id },
        });
    }
    async getByDriver(driverId) {
        this.logger.log(`getByDriver (driverId: ${driverId})`);
        return this.prisma.trip.findMany({
            where: { driverId },
            include: { route: true },
            orderBy: { departureTime: 'asc' },
        });
    }
    async getDelayed() {
        this.logger.log('getDelayed');
        return this.prisma.trip.findMany({
            where: { status: client_1.TripStatus.DELAYED },
            include: { route: true, delays: true },
        });
    }
    async updateTime(id, departureTime, arrivalTime, operatorId) {
        this.logger.log(`updateTime (id: ${id}, operatorId: ${operatorId})`);
        return this.prisma.trip.update({
            where: { id },
            data: {
                departureTime,
                arrivalTime,
                operatorId,
                status: client_1.TripStatus.SCHEDULED,
            },
        });
    }
    async getByDate(date) {
        this.logger.log(`getByDate (${date.toISOString().split('T')[0]})`);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return this.prisma.trip.findMany({
            where: {
                departureTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: { route: true },
            orderBy: { departureTime: 'asc' },
        });
    }
    async getAvailableSeats(tripId) {
        this.logger.log(`getAvailableSeats (tripId: ${tripId})`);
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                bookings: {
                    where: {
                        status: { in: ['CONFIRMED', 'PENDING'] },
                    },
                },
            },
        });
        if (!trip)
            return { totalSeats: 40, bookedSeats: 0, availableSeats: 40 };
        const bookedSeats = trip.bookings.reduce((sum, b) => sum + b.seats, 0);
        const totalSeats = 40;
        return {
            totalSeats,
            bookedSeats,
            availableSeats: Math.max(0, totalSeats - bookedSeats),
        };
    }
};
exports.TripsService = TripsService;
exports.TripsService = TripsService = TripsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TripsService);
//# sourceMappingURL=trips.service.js.map