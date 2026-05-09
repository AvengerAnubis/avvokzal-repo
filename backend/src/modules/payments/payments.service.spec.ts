import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;

  const mockPrisma = {
    payment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all payments with booking relations', async () => {
      const mockPayments = [{ id: '1', booking: {} }];
      mockPrisma.payment.findMany.mockResolvedValue(mockPayments);

      const result = await service.findAll();

      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { booking: { include: { trip: { include: { route: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockPayments);
    });

    it('should filter payments by bookingId', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([]);

      await service.findAll('b1');

      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { bookingId: 'b1' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a payment with booking relations', async () => {
      const mockPayment = { id: '1', booking: {} };
      mockPrisma.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await service.findOne('1');

      expect(mockPrisma.payment.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { booking: { include: { trip: { include: { route: true } } } } },
      });
      expect(result).toEqual(mockPayment);
    });
  });

  describe('findByBooking', () => {
    it('should return payment for a booking', async () => {
      const mockPayment = { id: '1', bookingId: 'b1', booking: {} };
      mockPrisma.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await service.findByBooking('b1');

      expect(mockPrisma.payment.findUnique).toHaveBeenCalledWith({
        where: { bookingId: 'b1' },
        include: { booking: { include: { trip: { include: { route: true } } } } },
      });
      expect(result).toEqual(mockPayment);
    });
  });

  describe('create', () => {
    it('should throw error if booking not found', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.create({ bookingId: 'b1', amount: 1000 })).rejects.toThrow('Booking not found');
    });

    it('should create payment with booking amount if amount not provided', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({ id: 'b1', totalPrice: 2500 });
      const createdPayment = { id: 'p1', bookingId: 'b1', amount: 2500, status: PaymentStatus.PENDING };
      mockPrisma.payment.create.mockResolvedValue(createdPayment);

      const result = await service.create({ bookingId: 'b1', amount: 0 });

      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: {
          bookingId: 'b1',
          amount: 2500,
          paymentMethod: 'card',
          status: PaymentStatus.PENDING,
        },
      });
      expect(result).toEqual(createdPayment);
    });

    it('should create payment with provided amount', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({ id: 'b1', totalPrice: 2500 });
      const createdPayment = { id: 'p1', bookingId: 'b1', amount: 3000, status: PaymentStatus.PENDING };
      mockPrisma.payment.create.mockResolvedValue(createdPayment);

      const result = await service.create({ bookingId: 'b1', amount: 3000, paymentMethod: 'cash' });

      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: {
          bookingId: 'b1',
          amount: 3000,
          paymentMethod: 'cash',
          status: PaymentStatus.PENDING,
        },
      });
      expect(result).toEqual(createdPayment);
    });
  });

  describe('update', () => {
    it('should update a payment', async () => {
      const updatedPayment = { id: '1', status: PaymentStatus.COMPLETED };
      mockPrisma.payment.update.mockResolvedValue(updatedPayment);

      const result = await service.update('1', { status: PaymentStatus.COMPLETED });

      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: PaymentStatus.COMPLETED },
      });
      expect(result).toEqual(updatedPayment);
    });
  });

  describe('process', () => {
    it('should throw error if payment not found', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);

      await expect(service.process('1')).rejects.toThrow('Payment not found');
    });

    it('should mark payment as completed with transaction ID', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({ id: '1', status: PaymentStatus.PENDING });
      const processedPayment = {
        id: '1',
        status: PaymentStatus.COMPLETED,
        transactionId: 'TXN-123-abc',
        paidAt: new Date(),
        booking: {},
      };
      mockPrisma.payment.update.mockResolvedValue(processedPayment);

      const result = await service.process('1');

      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          status: PaymentStatus.COMPLETED,
          transactionId: expect.stringMatching(/^TXN-\d+-[a-z0-9]+$/),
          paidAt: expect.any(Date),
        },
        include: { booking: true },
      });
      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(result.transactionId).toMatch(/^TXN-\d+-[a-z0-9]+$/);
    });
  });

  describe('refund', () => {
    it('should mark payment as refunded', async () => {
      const refundedPayment = { id: '1', status: PaymentStatus.REFUNDED };
      mockPrisma.payment.update.mockResolvedValue(refundedPayment);

      const result = await service.refund('1');

      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: PaymentStatus.REFUNDED },
      });
      expect(result).toEqual(refundedPayment);
    });
  });
});
