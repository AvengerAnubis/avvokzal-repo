import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private prisma: PrismaService) {}

  async getMessages(driverId: string) {
    this.logger.log(`getMessages (driverId: ${driverId})`);
    return this.prisma.chatMessage.findMany({
      where: { driverId },
      include: {
        driver: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(driverId: string, content: string) {
    this.logger.log(`sendMessage (driverId: ${driverId}, content: "${content.substring(0, 50)}...")`);
    return this.prisma.chatMessage.create({
      data: { driverId, content },
      include: {
        driver: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async markAsRead(messageId: string) {
    this.logger.log(`markAsRead (messageId: ${messageId})`);
    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(driverId: string) {
    this.logger.log(`markAllAsRead (driverId: ${driverId})`);
    return this.prisma.chatMessage.updateMany({
      where: { driverId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(driverId: string) {
    this.logger.log(`getUnreadCount (driverId: ${driverId})`);
    const count = await this.prisma.chatMessage.count({
      where: { driverId, isRead: false },
    });
    return { count };
  }
}