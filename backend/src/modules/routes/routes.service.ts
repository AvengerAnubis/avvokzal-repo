import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RoutesService {
  private readonly logger = new Logger(RoutesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll() {
    this.logger.log('findAll');
    return this.prisma.route.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    this.logger.log(`findOne (id: ${id})`);
    return this.prisma.route.findUnique({
      where: { id },
      include: { trips: true },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    origin: string;
    destination: string;
    distance?: number;
    duration?: number;
    price: number;
  }) {
    this.logger.log(`create (${data.origin} → ${data.destination})`);
    return this.prisma.route.create({
      data: {
        ...data,
        isActive: true,
      },
    });
  }

  async update(id: string, data: Partial<{
    name: string;
    description: string;
    origin: string;
    destination: string;
    distance: number;
    duration: number;
    price: number;
    isActive: boolean;
  }>) {
    this.logger.log(`update (id: ${id})`);
    return this.prisma.route.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    // Soft delete - делаем неактивным
    this.logger.log(`remove (id: ${id}) [soft delete]`);
    return this.prisma.route.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async search(origin: string, destination: string) {
    this.logger.log(`search (${origin} → ${destination})`);
    return this.prisma.route.findMany({
      where: {
        isActive: true,
        OR: [
          { origin: { contains: origin, mode: 'insensitive' } },
          { destination: { contains: destination, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}