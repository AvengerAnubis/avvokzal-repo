import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BusesService {
  private readonly logger = new Logger(BusesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.bus.findMany({ orderBy: { plateNumber: 'asc' } });
  }

  async findOne(id: string) {
    return this.prisma.bus.findUnique({ where: { id } });
  }

  async create(data: { plateNumber: string; model?: string; totalSeats?: number }) {
    return this.prisma.bus.create({
      data: { ...data, isActive: true },
    });
  }

  async update(id: string, data: { plateNumber?: string; model?: string; totalSeats?: number; isActive?: boolean }) {
    return this.prisma.bus.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.bus.update({ where: { id }, data: { isActive: false } });
  }
}
