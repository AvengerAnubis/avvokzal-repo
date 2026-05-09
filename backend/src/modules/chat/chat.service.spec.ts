import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ChatService', () => {
  let service: ChatService;
  let prisma: PrismaService;

  const mockPrisma = {
    chatMessage: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getMessages', () => {
    it('should return all messages for a driver ordered by createdAt', async () => {
      const mockMessages = [
        { id: '1', driverId: 'd1', content: 'Hello', isRead: true, driver: {} },
        { id: '2', driverId: 'd1', content: 'World', isRead: false, driver: {} },
      ];
      mockPrisma.chatMessage.findMany.mockResolvedValue(mockMessages);

      const result = await service.getMessages('d1');

      expect(mockPrisma.chatMessage.findMany).toHaveBeenCalledWith({
        where: { driverId: 'd1' },
        include: { driver: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual(mockMessages);
    });
  });

  describe('sendMessage', () => {
    it('should create a new chat message', async () => {
      const createdMessage = { id: 'new-id', driverId: 'd1', content: 'Test message', driver: {} };
      mockPrisma.chatMessage.create.mockResolvedValue(createdMessage);

      const result = await service.sendMessage('d1', 'Test message');

      expect(mockPrisma.chatMessage.create).toHaveBeenCalledWith({
        data: { driverId: 'd1', content: 'Test message' },
        include: { driver: { select: { id: true, firstName: true, lastName: true } } },
      });
      expect(result).toEqual(createdMessage);
    });
  });

  describe('markAsRead', () => {
    it('should mark a single message as read', async () => {
      const updatedMessage = { id: '1', isRead: true };
      mockPrisma.chatMessage.update.mockResolvedValue(updatedMessage);

      const result = await service.markAsRead('1');

      expect(mockPrisma.chatMessage.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isRead: true },
      });
      expect(result).toEqual(updatedMessage);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread messages for a driver as read', async () => {
      const result = { count: 5 };
      mockPrisma.chatMessage.updateMany.mockResolvedValue(result);

      const res = await service.markAllAsRead('d1');

      expect(mockPrisma.chatMessage.updateMany).toHaveBeenCalledWith({
        where: { driverId: 'd1', isRead: false },
        data: { isRead: true },
      });
      expect(res).toEqual(result);
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread messages for a driver', async () => {
      mockPrisma.chatMessage.count.mockResolvedValue(3);

      const result = await service.getUnreadCount('d1');

      expect(mockPrisma.chatMessage.count).toHaveBeenCalledWith({
        where: { driverId: 'd1', isRead: false },
      });
      expect(result).toEqual({ count: 3 });
    });

    it('should return 0 if no unread messages', async () => {
      mockPrisma.chatMessage.count.mockResolvedValue(0);

      const result = await service.getUnreadCount('d1');

      expect(result).toEqual({ count: 0 });
    });
  });
});
