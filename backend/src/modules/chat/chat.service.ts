import { Injectable, Logger, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatStatus, MessageSenderRole } from '@prisma/client';

const HEARTBEAT_TIMEOUT_MS = 30_000;
const HEARTBEAT_GRACE_MS = 30_000;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private prisma: PrismaService) {}

  private get now() {
    return new Date();
  }

  // ===================== CREATE =====================

  async create(driverId: string, text: string) {
    this.logger.log(`create (driverId: ${driverId})`);

    const existing = await this.prisma.chat.findFirst({
      where: {
        driverId,
        status: { in: [ChatStatus.WAITING, ChatStatus.ACTIVE] },
      },
    });

    if (existing) {
      const message = await this.prisma.message.create({
        data: {
          chatId: existing.id,
          senderId: driverId,
          senderRole: MessageSenderRole.DRIVER,
          text,
        },
        include: { sender: { select: { id: true, firstName: true, lastName: true } } },
      });
      return { chat: existing, message };
    }

    const chat = await this.prisma.chat.create({
      data: {
        driverId,
        status: ChatStatus.WAITING,
        messages: {
          create: {
            senderId: driverId,
            senderRole: MessageSenderRole.DRIVER,
            text,
          },
        },
      },
      include: {
        driver: { select: { id: true, firstName: true, lastName: true } },
        messages: {
          include: { sender: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return { chat, message: chat.messages[0] };
  }

  // ===================== HEARTBEAT =====================

  async heartbeat(chatId: string) {
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) throw new NotFoundException('Chat not found');
    if (chat.status === ChatStatus.CLOSED) throw new BadRequestException('Chat is closed');

    await this.prisma.chat.update({
      where: { id: chatId },
      data: { lastHeartbeatAt: this.now },
    });
  }

  // ===================== CLOSE EXPIRED =====================

  private async closeExpiredChats() {
    const cutoff = new Date(this.now.getTime() - HEARTBEAT_TIMEOUT_MS);

    const expired = await this.prisma.chat.findMany({
      where: {
        status: ChatStatus.WAITING,
        OR: [
          { lastHeartbeatAt: { lt: cutoff } },
          { lastHeartbeatAt: null, createdAt: { lt: new Date(this.now.getTime() - HEARTBEAT_GRACE_MS) } },
        ],
      },
    });

    if (expired.length > 0) {
      await this.prisma.chat.updateMany({
        where: { id: { in: expired.map(c => c.id) } },
        data: { status: ChatStatus.CLOSED, closedAt: this.now },
      });
      this.logger.log(`Auto-closed ${expired.length} expired chat(s)`);
    }
  }

  // ===================== GET AVAILABLE =====================

  async getAvailable() {
    await this.closeExpiredChats();

    const heartbeatCutoff = new Date(this.now.getTime() - HEARTBEAT_TIMEOUT_MS);

    return this.prisma.chat.findMany({
      where: {
        status: ChatStatus.WAITING,
        operatorId: null,
        OR: [
          { lastHeartbeatAt: { gte: heartbeatCutoff } },
          { lastHeartbeatAt: null, createdAt: { gte: new Date(this.now.getTime() - HEARTBEAT_GRACE_MS) } },
        ],
      },
      include: {
        driver: { select: { id: true, firstName: true, lastName: true, email: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ===================== ASSIGN =====================

  async assign(chatId: string, operatorId: string) {
    this.logger.log(`assign (chatId: ${chatId}, operatorId: ${operatorId})`);

    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) throw new NotFoundException('Chat not found');
    if (chat.status === ChatStatus.CLOSED) throw new BadRequestException('Chat is closed');

    // Check heartbeat is still valid (if driver is still there)
    if (chat.lastHeartbeatAt) {
      const elapsed = this.now.getTime() - chat.lastHeartbeatAt.getTime();
      if (elapsed > HEARTBEAT_TIMEOUT_MS) {
        await this.prisma.chat.update({
          where: { id: chatId },
          data: { status: ChatStatus.CLOSED, closedAt: this.now },
        });
        throw new BadRequestException('Driver disconnected. Chat closed.');
      }
    } else if (this.now.getTime() - chat.createdAt.getTime() > HEARTBEAT_GRACE_MS) {
      await this.prisma.chat.update({
        where: { id: chatId },
        data: { status: ChatStatus.CLOSED, closedAt: this.now },
      });
      throw new BadRequestException('Driver disconnected. Chat closed.');
    }

    // Atomically assign — check no other operator took it
    const updated = await this.prisma.chat.updateMany({
      where: {
        id: chatId,
        status: ChatStatus.WAITING,
        operatorId: null,
      },
      data: {
        operatorId,
        status: ChatStatus.ACTIVE,
      },
    });

    if (updated.count === 0) {
      throw new ConflictException('Chat was already taken by another operator or is no longer available');
    }

    return this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        driver: { select: { id: true, firstName: true, lastName: true, email: true } },
        operator: { select: { id: true, firstName: true, lastName: true } },
        messages: {
          include: { sender: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  // ===================== SEND MESSAGE =====================

  async sendMessage(chatId: string, senderId: string, senderRole: MessageSenderRole, text: string) {
    this.logger.log(`sendMessage (chatId: ${chatId}, senderRole: ${senderRole})`);

    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) throw new NotFoundException('Chat not found');
    if (chat.status === ChatStatus.CLOSED) throw new BadRequestException('Chat is closed');

    // If driver sends a message and chat is WAITING, update heartbeat
    if (senderRole === MessageSenderRole.DRIVER && chat.status === ChatStatus.WAITING) {
      await this.prisma.chat.update({
        where: { id: chatId },
        data: { lastHeartbeatAt: this.now },
      });
    }

    return this.prisma.message.create({
      data: {
        chatId,
        senderId,
        senderRole,
        text,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });
  }

  // ===================== GET MESSAGES =====================

  async getMessages(chatId: string) {
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) throw new NotFoundException('Chat not found');

    return this.prisma.message.findMany({
      where: { chatId },
      include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ===================== CLOSE =====================

  async close(chatId: string, userId: string) {
    this.logger.log(`close (chatId: ${chatId}, userId: ${userId})`);

    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) throw new NotFoundException('Chat not found');
    if (chat.status === ChatStatus.CLOSED) throw new BadRequestException('Chat is already closed');

    await this.prisma.chat.update({
      where: { id: chatId },
      data: { status: ChatStatus.CLOSED, closedAt: this.now },
    });
  }

  // ===================== GET HISTORY =====================

  async getHistory(userId: string, role: string) {
    this.logger.log(`getHistory (userId: ${userId}, role: ${role})`);

    const where =
      role === 'ADMIN'
        ? {}
        : role === 'OPERATOR'
          ? { operatorId: userId }
          : { driverId: userId };

    return this.prisma.chat.findMany({
      where: {
        ...where,
        status: ChatStatus.CLOSED,
      },
      include: {
        driver: { select: { id: true, firstName: true, lastName: true, email: true } },
        operator: { select: { id: true, firstName: true, lastName: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { id: true, firstName: true, lastName: true } } },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { closedAt: 'desc' },
    });
  }

  // ===================== GET BY ID =====================

  async getById(chatId: string, userId: string, role: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        driver: { select: { id: true, firstName: true, lastName: true, email: true } },
        operator: { select: { id: true, firstName: true, lastName: true } },
        messages: {
          include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) throw new NotFoundException('Chat not found');

    // Authorization: admin sees all, operator sees their own, driver sees their own
    if (role !== 'ADMIN' && chat.operatorId !== userId && chat.driverId !== userId) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  // ===================== GET ACTIVE BY OPERATOR =====================

  async getActiveByOperator(operatorId: string) {
    return this.prisma.chat.findMany({
      where: {
        status: ChatStatus.ACTIVE,
        operatorId,
      },
      include: {
        driver: { select: { id: true, firstName: true, lastName: true, email: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { id: true, firstName: true, lastName: true } } },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // ===================== GET DRIVER'S ACTIVE CHAT =====================

  async getDriverActiveChat(driverId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        driverId,
        status: { in: [ChatStatus.WAITING, ChatStatus.ACTIVE] },
      },
      include: {
        operator: { select: { id: true, firstName: true, lastName: true } },
        messages: {
          include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return chat;
  }
}