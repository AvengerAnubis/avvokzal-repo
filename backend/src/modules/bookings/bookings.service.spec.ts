import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: PrismaService;

  const mockPrisma = {
    booking: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    trip: {
      findUnique: jest.fn(),
    },
    payment: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all bookings with relations', async () => {
      const mockBookings = [{ id: '1', trip: {}, user: {}, payment: {} }];
      mockPrisma.booking.findMany.mockResolvedValue(mockBookings);

      const result = await service.findAll();

      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: {
          trip: { include: { route: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockBookings);
    });

    it('should filter bookings by userId', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([]);

      await service.findAll('user-1');

      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a booking with full relations', async () => {
      const mockBooking = { id: '1', trip: {}, user: {}, payment: {}, tickets: [] };
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await service.findOne('1');

      expect(mockPrisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          trip: { include: { route: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          payment: true,
          tickets: true,
        },
      });
      expect(result).toEqual(mockBooking);
    });
  });

  describe('create', () => {
    const createData = {
      userId: 'u1',
      tripId: 't1',
      seats: 2,
      passengerName: 'Test User',
      passengerPhone: '+79000000000',
    };

    it('should throw error if trip not found', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue(null);

      await expect(service.create(createData)).rejects.toThrow('Trip not found');
    });

    it('should create a booking with correct total price', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue({
        id: 't1',
        route: { price: 1500 },
      });
      const createdBooking = {
        id: 'b1',
        ...createData,
        totalPrice: 3000,
        status: BookingStatus.PENDING,
      };
      mockPrisma.booking.create.mockResolvedValue(createdBooking);

      const result = await service.create(createData);

      expect(mockPrisma.booking.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          tripId: 't1',
          seats: 2,
          totalPrice: 3000,
          passengerName: 'Test User',
          passengerPhone: '+79000000000',
          status: BookingStatus.PENDING,
        },
        include: { trip: { include: { route: true } } },
      });
      expect(result).toEqual(createdBooking);
    });
  });

  describe('update', () => {
    it('should update a booking', async () => {
      const updatedBooking = { id: '1', status: BookingStatus.CONFIRMED };
      mockPrisma.booking.update.mockResolvedValue(updatedBooking);

      const result = await service.update('1', { status: BookingStatus.CONFIRMED });

      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: BookingStatus.CONFIRMED },
      });
      expect(result).toEqual(updatedBooking);
    });
  });

  describe('remove', () => {
    it('should delete a booking', async () => {
      mockPrisma.booking.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');

      expect(mockPrisma.booking.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('getByUser', () => {
    it('should return bookings for a specific user', async () => {
      const mockBookings = [{ id: '1', userId: 'u1', trip: {}, payment: {}, tickets: [] }];
      mockPrisma.booking.findMany.mockResolvedValue(mockBookings);

      const result = await service.getByUser('u1');

      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        include: {
          trip: { include: { route: true } },
          payment: true,
          tickets: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockBookings);
    });
  });

  describe('confirm', () => {
    it('should confirm a booking', async () => {
      const confirmedBooking = { id: '1', status: BookingStatus.CONFIRMED, trip: {}, tickets: [] };
      mockPrisma.booking.update.mockResolvedValue(confirmedBooking);

      const result = await service.confirm('1');

      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: BookingStatus.CONFIRMED },
        include: { trip: { include: { route: true } }, tickets: true },
      });
      expect(result).toEqual(confirmedBooking);
    });
  });

  describe('cancel', () => {
    it('should throw error if booking not found', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.cancel('1')).rejects.toThrow('Booking not found');
    });

    it('should refund payment if exists and cancel booking', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: '1',
        payment: { id: 'p1', status: 'COMPLETED' },
      });
      mockPrisma.booking.update.mockResolvedValue({ id: '1', status: BookingStatus.CANCELLED });

      const result = await service.cancel('1');

      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { bookingId: '1' },
        data: { status: 'REFUNDED' },
      });
      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: BookingStatus.CANCELLED },
      });
      expect(result).toEqual({ id: '1', status: BookingStatus.CANCELLED });
    });

    it('should cancel booking without refund if no payment', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: '1',
        payment: null,
      });
      mockPrisma.booking.update.mockResolvedValue({ id: '1', status: BookingStatus.CANCELLED });

      const result = await service.cancel('1');

      expect(mockPrisma.payment.update).not.toHaveBeenCalled();
      expect(result).toEqual({ id: '1', status: BookingStatus.CANCELLED });
    });
  });
});
