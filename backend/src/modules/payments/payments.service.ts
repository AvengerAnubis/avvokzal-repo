import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(bookingId?: string) {
    this.logger.log(`findAll${bookingId ? ` (bookingId: ${bookingId})` : ''}`);
    return this.prisma.payment.findMany({
      where: bookingId ? { bookingId } : undefined,
      include: { booking: { include: { trip: { include: { route: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    this.logger.log(`findOne (id: ${id})`);
    return this.prisma.payment.findUnique({
      where: { id },
      include: { booking: { include: { trip: { include: { route: true } } } } },
    });
  }

  async findByBooking(bookingId: string) {
    this.logger.log(`findByBooking (bookingId: ${bookingId})`);
    return this.prisma.payment.findUnique({
      where: { bookingId },
      include: { booking: { include: { trip: { include: { route: true } } } } },
    });
  }

  async create(data: {
    bookingId: string;
    amount: number;
    paymentMethod?: string;
  }) {
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
        status: PaymentStatus.PENDING,
      },
    });
  }

  async update(id: string, data: Partial<{
    status: PaymentStatus;
    transactionId: string;
    paidAt: Date;
  }>) {
    this.logger.log(`update (id: ${id})`);
    return this.prisma.payment.update({
      where: { id },
      data,
    });
  }

  async process(id: string) {
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
        status: PaymentStatus.COMPLETED,
        transactionId,
        paidAt: new Date(),
      },
      include: { booking: true },
    });
  }

  async refund(id: string) {
    this.logger.log(`refund (id: ${id})`);
    return this.prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.REFUNDED },
    });
  }
}