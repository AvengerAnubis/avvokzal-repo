import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    this.logger.log(`findAll (userId: ${userId})`);
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { route: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, routeId: string) {
    this.logger.log(`add (userId: ${userId}, routeId: ${routeId})`);
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_routeId: { userId, routeId } },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.favorite.create({
      data: { userId, routeId },
      include: { route: true },
    });
  }

  async remove(userId: string, routeId: string) {
    this.logger.log(`remove (userId: ${userId}, routeId: ${routeId})`);
    return this.prisma.favorite.delete({
      where: { userId_routeId: { userId, routeId } },
    });
  }

  async isFavorite(userId: string, routeId: string) {
    this.logger.log(`isFavorite (userId: ${userId}, routeId: ${routeId})`);
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_routeId: { userId, routeId } },
    });
    return { isFavorite: !!favorite };
  }
}