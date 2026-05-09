import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TripStatus } from '@prisma/client';

@Injectable()
export class DelaysService {
  private readonly logger = new Logger(DelaysService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(tripId?: string) {
    this.logger.log(`findAll${tripId ? ` (tripId: ${tripId})` : ''}`);
    return this.prisma.delay.findMany({
      where: tripId ? { tripId } : undefined,
      include: { trip: { include: { route: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    this.logger.log(`findOne (id: ${id})`);
    return this.prisma.delay.findUnique({
      where: { id },
      include: { trip: { include: { route: true } } },
    });
  }

  async create(data: {
    tripId: string;
    reason?: string;
    delayMinutes: number;
  }) {
    this.logger.log(`create (tripId: ${data.tripId}, delay: ${data.delayMinutes}min)`);
    await this.prisma.trip.update({
      where: { id: data.tripId },
      data: { status: TripStatus.DELAYED },
    });

    return this.prisma.delay.create({
      data,
      include: { trip: { include: { route: true } } },
    });
  }

  async getByTrip(tripId: string) {
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
}