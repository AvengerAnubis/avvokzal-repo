import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TripStatus } from '@prisma/client';

describe('TripsService', () => {
  let service: TripsService;
  let prisma: PrismaService;

  const mockPrisma = {
    trip: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all trips with route and driver', async () => {
      const mockTrips = [
        { id: '1', routeId: 'r1', status: TripStatus.SCHEDULED, route: {}, driver: {} },
      ];
      mockPrisma.trip.findMany.mockResolvedValue(mockTrips);

      const result = await service.findAll();

      expect(mockPrisma.trip.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { route: true, driver: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { departureTime: 'asc' },
      });
      expect(result).toEqual(mockTrips);
    });

    it('should filter trips by routeId', async () => {
      mockPrisma.trip.findMany.mockResolvedValue([]);

      await service.findAll('route-1');

      expect(mockPrisma.trip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { routeId: 'route-1' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a trip with route, driver, and bookings', async () => {
      const mockTrip = { id: '1', route: {}, driver: {}, bookings: [] };
      mockPrisma.trip.findUnique.mockResolvedValue(mockTrip);

      const result = await service.findOne('1');

      expect(mockPrisma.trip.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          route: true,
          driver: { select: { id: true, firstName: true, lastName: true } },
          bookings: { include: { user: true } },
        },
      });
      expect(result).toEqual(mockTrip);
    });
  });

  describe('create', () => {
    it('should create a trip', async () => {
      const createData = {
        routeId: 'r1',
        departureTime: new Date('2026-05-01T08:00:00'),
        arrivalTime: new Date('2026-05-01T20:00:00'),
        busNumber: 'A123AA',
      };
      const createdTrip = { id: 'new-id', ...createData };
      mockPrisma.trip.create.mockResolvedValue(createdTrip);

      const result = await service.create(createData);

      expect(mockPrisma.trip.create).toHaveBeenCalledWith({
        data: createData,
        include: { route: true },
      });
      expect(result).toEqual(createdTrip);
    });
  });

  describe('update', () => {
    it('should update a trip', async () => {
      const updatedTrip = { id: '1', status: TripStatus.DELAYED };
      mockPrisma.trip.update.mockResolvedValue(updatedTrip);

      const result = await service.update('1', { status: TripStatus.DELAYED });

      expect(mockPrisma.trip.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: TripStatus.DELAYED },
      });
      expect(result).toEqual(updatedTrip);
    });
  });

  describe('remove', () => {
    it('should delete a trip', async () => {
      const deletedTrip = { id: '1' };
      mockPrisma.trip.delete.mockResolvedValue(deletedTrip);

      const result = await service.remove('1');

      expect(mockPrisma.trip.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(deletedTrip);
    });
  });

  describe('getByDriver', () => {
    it('should return trips for a specific driver', async () => {
      const mockTrips = [{ id: '1', driverId: 'd1', route: {} }];
      mockPrisma.trip.findMany.mockResolvedValue(mockTrips);

      const result = await service.getByDriver('d1');

      expect(mockPrisma.trip.findMany).toHaveBeenCalledWith({
        where: { driverId: 'd1' },
        include: { route: true },
        orderBy: { departureTime: 'asc' },
      });
      expect(result).toEqual(mockTrips);
    });
  });

  describe('getDelayed', () => {
    it('should return delayed trips with route and delays', async () => {
      const mockDelayed = [{ id: '1', status: TripStatus.DELAYED, route: {}, delays: [] }];
      mockPrisma.trip.findMany.mockResolvedValue(mockDelayed);

      const result = await service.getDelayed();

      expect(mockPrisma.trip.findMany).toHaveBeenCalledWith({
        where: { status: TripStatus.DELAYED },
        include: { route: true, delays: true },
      });
      expect(result).toEqual(mockDelayed);
    });
  });

  describe('updateTime', () => {
    it('should update trip times and set status to SCHEDULED', async () => {
      const departureTime = new Date('2026-05-01T09:00:00');
      const arrivalTime = new Date('2026-05-01T21:00:00');
      const updatedTrip = { id: '1', departureTime, arrivalTime, status: TripStatus.SCHEDULED };
      mockPrisma.trip.update.mockResolvedValue(updatedTrip);

      const result = await service.updateTime('1', departureTime, arrivalTime, 'op1');

      expect(mockPrisma.trip.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { departureTime, arrivalTime, operatorId: 'op1', status: TripStatus.SCHEDULED },
      });
      expect(result).toEqual(updatedTrip);
    });
  });

  describe('getByDate', () => {
    it('should return trips for a specific date', async () => {
      const date = new Date('2026-05-01');
      mockPrisma.trip.findMany.mockResolvedValue([]);

      await service.getByDate(date);

      expect(mockPrisma.trip.findMany).toHaveBeenCalledWith({
        where: {
          departureTime: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        include: { route: true },
        orderBy: { departureTime: 'asc' },
      });
    });
  });

  describe('getAvailableSeats', () => {
    it('should return default 40 seats if trip not found', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue(null);

      const result = await service.getAvailableSeats('nonexistent');

      expect(result).toEqual({ totalSeats: 40, bookedSeats: 0, availableSeats: 40 });
    });

    it('should calculate available seats correctly', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue({
        id: '1',
        bookings: [
          { id: 'b1', seats: 2 },
          { id: 'b2', seats: 3 },
        ],
      });

      const result = await service.getAvailableSeats('1');

      expect(result).toEqual({ totalSeats: 40, bookedSeats: 5, availableSeats: 35 });
    });

    it('should not return negative available seats', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue({
        id: '1',
        bookings: [
          { id: 'b1', seats: 25 },
          { id: 'b2', seats: 20 },
        ],
      });

      const result = await service.getAvailableSeats('1');

      expect(result).toEqual({ totalSeats: 40, bookedSeats: 45, availableSeats: 0 });
    });
  });
});
