import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string) {
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

  async findOne(id: string) {
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

  async create(data: {
    userId: string;
    tripId: string;
    seats: number;
    passengerName?: string;
    passengerPhone?: string;
  }) {
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
        status: BookingStatus.PENDING,
      },
      include: {
        trip: { include: { route: true } },
      },
    });
  }

  async update(id: string, data: Partial<{
    seats: number;
    status: BookingStatus;
    passengerName: string;
    passengerPhone: string;
  }>) {
    this.logger.log(`update (id: ${id})`);
    return this.prisma.booking.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    this.logger.log(`remove (id: ${id})`);
    return this.prisma.booking.delete({
      where: { id },
    });
  }

  async getByUser(userId: string) {
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

  async confirm(id: string) {
    this.logger.log(`confirm (id: ${id})`);
    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CONFIRMED },
      include: {
        trip: { include: { route: true } },
        tickets: true,
      },
    });
  }

  async cancel(id: string) {
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
      data: { status: BookingStatus.CANCELLED },
    });
  }
}