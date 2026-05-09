import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TripStatus } from '@prisma/client';

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(private prisma: PrismaService) {}

  async findByRoute(routeId: string) {
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

  async findAll(routeId?: string) {
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

  async findOne(id: string) {
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

  async create(data: {
    routeId: string;
    departureTime: Date;
    arrivalTime: Date;
    busNumber?: string;
    driverId?: string;
  }) {
    this.logger.log(`create (routeId: ${data.routeId})`);
    return this.prisma.trip.create({
      data,
      include: { route: true },
    });
  }

  async update(id: string, data: Partial<{
    departureTime: Date;
    arrivalTime: Date;
    status: TripStatus;
    busNumber: string;
    driverId: string;
    operatorId: string;
  }>) {
    this.logger.log(`update (id: ${id})`);
    return this.prisma.trip.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    this.logger.log(`remove (id: ${id})`);
    return this.prisma.trip.delete({
      where: { id },
    });
  }

  async getByDriver(driverId: string) {
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
      where: { status: TripStatus.DELAYED },
      include: { route: true, delays: true },
    });
  }

  async updateTime(id: string, departureTime: Date, arrivalTime: Date, operatorId: string) {
    this.logger.log(`updateTime (id: ${id}, operatorId: ${operatorId})`);
    return this.prisma.trip.update({
      where: { id },
      data: {
        departureTime,
        arrivalTime,
        operatorId,
        status: TripStatus.SCHEDULED,
      },
    });
  }

  async getByDate(date: Date) {
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

  async getAvailableSeats(tripId: string) {
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

    if (!trip) return { totalSeats: 40, bookedSeats: 0, availableSeats: 40 };

    const bookedSeats = trip.bookings.reduce((sum, b) => sum + b.seats, 0);
    const totalSeats = 40;

    return {
      totalSeats,
      bookedSeats,
      availableSeats: Math.max(0, totalSeats - bookedSeats),
    };
  }
}