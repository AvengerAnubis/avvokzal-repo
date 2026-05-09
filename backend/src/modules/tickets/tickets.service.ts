import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string) {
    this.logger.log(`findAll${userId ? ` (userId: ${userId})` : ''}`);
    const where = userId ? { booking: { userId } } : {};
    return this.prisma.ticket.findMany({
      where,
      include: { booking: true, trip: { include: { route: true } } },
    });
  }

  async findOne(id: string) {
    this.logger.log(`findOne (id: ${id})`);
    return this.prisma.ticket.findUnique({
      where: { id },
      include: { booking: true, trip: { include: { route: true } } },
    });
  }

  async findByBooking(bookingId: string) {
    this.logger.log(`findByBooking (bookingId: ${bookingId})`);
    return this.prisma.ticket.findMany({
      where: { bookingId },
      include: { trip: { include: { route: true } } },
    });
  }

  async create(data: { bookingId: string; tripId: string; seatNumber: number }) {
    this.logger.log(`create (bookingId: ${data.bookingId}, tripId: ${data.tripId}, seat: ${data.seatNumber})`);
    const qrCode = `TICKET-${randomBytes(16).toString('hex')}`;
    return this.prisma.ticket.create({
      data: {
        ...data,
        qrCode,
      },
      include: { trip: { include: { route: true } } },
    });
  }

  async markAsUsed(id: string) {
    this.logger.log(`markAsUsed (id: ${id})`);
    return this.prisma.ticket.update({
      where: { id },
      data: { isUsed: true, usedAt: new Date() },
    });
  }

  async validate(id: string) {
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
}