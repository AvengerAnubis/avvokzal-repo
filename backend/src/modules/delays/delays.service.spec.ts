import { Test, TestingModule } from '@nestjs/testing';
import { DelaysService } from './delays.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TripStatus } from '@prisma/client';

describe('DelaysService', () => {
  let service: DelaysService;
  let prisma: PrismaService;

  const mockPrisma = {
    delay: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    trip: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DelaysService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DelaysService>(DelaysService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all delays with trip relations', async () => {
      const mockDelays = [{ id: '1', trip: {} }];
      mockPrisma.delay.findMany.mockResolvedValue(mockDelays);

      const result = await service.findAll();

      expect(mockPrisma.delay.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { trip: { include: { route: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockDelays);
    });

    it('should filter delays by tripId', async () => {
      mockPrisma.delay.findMany.mockResolvedValue([]);

      await service.findAll('t1');

      expect(mockPrisma.delay.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tripId: 't1' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a delay with trip relations', async () => {
      const mockDelay = { id: '1', trip: {} };
      mockPrisma.delay.findUnique.mockResolvedValue(mockDelay);

      const result = await service.findOne('1');

      expect(mockPrisma.delay.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { trip: { include: { route: true } } },
      });
      expect(result).toEqual(mockDelay);
    });
  });

  describe('create', () => {
    it('should set trip status to DELAYED and create delay record', async () => {
      const createData = {
        tripId: 't1',
        reason: 'Bad weather',
        delayMinutes: 30,
      };
      const createdDelay = { id: 'd1', ...createData, trip: {} };
      mockPrisma.delay.create.mockResolvedValue(createdDelay);

      const result = await service.create(createData);

      expect(mockPrisma.trip.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { status: TripStatus.DELAYED },
      });
      expect(mockPrisma.delay.create).toHaveBeenCalledWith({
        data: createData,
        include: { trip: { include: { route: true } } },
      });
      expect(result).toEqual(createdDelay);
    });
  });

  describe('getByTrip', () => {
    it('should return delays for a specific trip', async () => {
      const mockDelays = [{ id: '1', tripId: 't1' }];
      mockPrisma.delay.findMany.mockResolvedValue(mockDelays);

      const result = await service.getByTrip('t1');

      expect(mockPrisma.delay.findMany).toHaveBeenCalledWith({
        where: { tripId: 't1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockDelays);
    });
  });

  describe('getAllWithTrips', () => {
    it('should return all delays with trip and route relations', async () => {
      const mockDelays = [{ id: '1', trip: { route: {} } }];
      mockPrisma.delay.findMany.mockResolvedValue(mockDelays);

      const result = await service.getAllWithTrips();

      expect(mockPrisma.delay.findMany).toHaveBeenCalledWith({
        include: { trip: { include: { route: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockDelays);
    });
  });
});
