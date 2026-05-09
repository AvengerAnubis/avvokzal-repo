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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(bookingId) {
        this.logger.log(`findAll${bookingId ? ` (bookingId: ${bookingId})` : ''}`);
        return this.prisma.payment.findMany({
            where: bookingId ? { bookingId } : undefined,
            include: { booking: { include: { trip: { include: { route: true } } } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        this.logger.log(`findOne (id: ${id})`);
        return this.prisma.payment.findUnique({
            where: { id },
            include: { booking: { include: { trip: { include: { route: true } } } } },
        });
    }
    async findByBooking(bookingId) {
        this.logger.log(`findByBooking (bookingId: ${bookingId})`);
        return this.prisma.payment.findUnique({
            where: { bookingId },
            include: { booking: { include: { trip: { include: { route: true } } } } },
        });
    }
    async create(data) {
        this.logger.log(`create (bookingId: ${data.bookingId}, amount: ${data.amount})`);
        const booking = await this.prisma.booking.findUnique({
            where: { id: data.bookingId },
        });
        if (!booking) {
            throw new Error('Booking not found');
        }
        return this.prisma.payment.create({
            data: {
                bookingId: data.bookingId,
                amount: data.amount || booking.totalPrice,
                paymentMethod: data.paymentMethod || 'card',
                status: client_1.PaymentStatus.PENDING,
            },
        });
    }
    async update(id, data) {
        this.logger.log(`update (id: ${id})`);
        return this.prisma.payment.update({
            where: { id },
            data,
        });
    }
    async process(id) {
        this.logger.log(`process (id: ${id})`);
        const payment = await this.prisma.payment.findUnique({
            where: { id },
        });
        if (!payment) {
            throw new Error('Payment not found');
        }
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return this.prisma.payment.update({
            where: { id },
            data: {
                status: client_1.PaymentStatus.COMPLETED,
                transactionId,
                paidAt: new Date(),
            },
            include: { booking: true },
        });
    }
    async refund(id) {
        this.logger.log(`refund (id: ${id})`);
        return this.prisma.payment.update({
            where: { id },
            data: { status: client_1.PaymentStatus.REFUNDED },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map