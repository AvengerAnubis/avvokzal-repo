import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('TicketsService', () => {
  let service: TicketsService;
  let prisma: PrismaService;

  const mockPrisma = {
    ticket: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all tickets with relations', async () => {
      const mockTickets = [{ id: '1', booking: {}, trip: {} }];
      mockPrisma.ticket.findMany.mockResolvedValue(mockTickets);

      const result = await service.findAll();

      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith({
        where: {},
        include: { booking: true, trip: { include: { route: true } } },
      });
      expect(result).toEqual(mockTickets);
    });

    it('should filter tickets by userId', async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([]);

      await service.findAll('u1');

      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith({
        where: { booking: { userId: 'u1' } },
        include: { booking: true, trip: { include: { route: true } } },
      });
    });
  });

  describe('findOne', () => {
    it('should return a ticket with booking and trip relations', async () => {
      const mockTicket = { id: '1', booking: {}, trip: {} };
      mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);

      const result = await service.findOne('1');

      expect(mockPrisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { booking: true, trip: { include: { route: true } } },
      });
      expect(result).toEqual(mockTicket);
    });
  });

  describe('findByBooking', () => {
    it('should return tickets for a booking', async () => {
      const mockTickets = [{ id: '1', bookingId: 'b1', trip: {} }];
      mockPrisma.ticket.findMany.mockResolvedValue(mockTickets);

      const result = await service.findByBooking('b1');

      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith({
        where: { bookingId: 'b1' },
        include: { trip: { include: { route: true } } },
      });
      expect(result).toEqual(mockTickets);
    });
  });

  describe('create', () => {
    it('should create a ticket with generated QR code', async () => {
      const createData = { bookingId: 'b1', tripId: 't1', seatNumber: 5 };
      const createdTicket = { id: 'new-id', ...createData, qrCode: 'TICKET-abc123', trip: {} };
      mockPrisma.ticket.create.mockResolvedValue(createdTicket);

      const result = await service.create(createData);

      expect(mockPrisma.ticket.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          qrCode: expect.stringMatching(/^TICKET-[a-f0-9]+$/),
        },
        include: { trip: { include: { route: true } } },
      });
      expect(result.qrCode).toMatch(/^TICKET-[a-f0-9]+$/);
    });
  });

  describe('markAsUsed', () => {
    it('should mark a ticket as used with timestamp', async () => {
      const usedTicket = { id: '1', isUsed: true, usedAt: new Date() };
      mockPrisma.ticket.update.mockResolvedValue(usedTicket);

      const result = await service.markAsUsed('1');

      expect(mockPrisma.ticket.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isUsed: true, usedAt: expect.any(Date) },
      });
      expect(result).toEqual(usedTicket);
    });
  });

  describe('validate', () => {
    it('should return invalid if ticket not found', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null);

      const result = await service.validate('nonexistent');

      expect(result).toEqual({ valid: false, error: 'Билет не найден' });
    });

    it('should return invalid if ticket already used', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({ id: '1', isUsed: true, trip: {} });

      const result = await service.validate('1');

      expect(result).toEqual({ valid: false, error: 'Билет уже использован' });
    });

    it('should return valid for unused ticket', async () => {
      const mockTicket = { id: '1', isUsed: false, trip: {} };
      mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket);

      const result = await service.validate('1');

      expect(result).toEqual({ valid: true, ticket: mockTicket });
    });
  });
});
