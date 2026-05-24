import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
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
    seatNumbers: number[];
    passengerName?: string;
    passengerPhone?: string;
    passengerEmail?: string;
  }) {
    this.logger.log(`create (userId: ${data.userId}, tripId: ${data.tripId}, seats: ${data.seatNumbers.length})`);

    const trip = await this.prisma.trip.findUnique({
      where: { id: data.tripId },
      include: { route: true, bookings: {
        where: { status: { in: ['CONFIRMED', 'PENDING'] } },
      } },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const totalSeats = trip.totalSeats;

    // Validate seat numbers
    const seatNumbers = [...new Set(data.seatNumbers)];
    for (const sn of seatNumbers) {
      if (sn < 1 || sn > totalSeats) {
        throw new BadRequestException(`Invalid seat number: ${sn}. Must be 1-${totalSeats}`);
      }
    }

    // Check which seats are already booked
    const bookedSeatNumbers = new Set<number>();
    for (const booking of trip.bookings) {
      for (const sn of booking.seatNumbers) {
        bookedSeatNumbers.add(sn);
      }
    }

    const alreadyBooked = seatNumbers.filter(sn => bookedSeatNumbers.has(sn));
    if (alreadyBooked.length > 0) {
      throw new BadRequestException(`Seats already booked: ${alreadyBooked.join(', ')}`);
    }

    const routePrice = Number(trip.route.price);
    const totalPrice = routePrice * seatNumbers.length;

    // Create booking with tickets
    const booking = await this.prisma.booking.create({
      data: {
        userId: data.userId,
        tripId: data.tripId,
        seats: seatNumbers.length,
        seatNumbers,
        totalPrice,
        passengerName: data.passengerName,
        passengerPhone: data.passengerPhone,
        passengerEmail: data.passengerEmail,
        status: BookingStatus.PENDING,
        tickets: {
          create: seatNumbers.map((seatNumber) => ({
            tripId: data.tripId,
            seatNumber,
            qrCode: `TICKET-${crypto.randomUUID().replace(/-/g, '').toUpperCase()}`,
          })),
        },
      },
      include: {
        trip: { include: { route: true } },
        tickets: true,
      },
    });

    return booking;
  }

  async update(id: string, data: Partial<{
    seats: number;
    seatNumbers: number[];
    status: BookingStatus;
    passengerName: string;
    passengerPhone: string;
    passengerEmail: string;
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
      throw new NotFoundException('Booking not found');
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