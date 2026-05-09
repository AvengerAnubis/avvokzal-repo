import { Test, TestingModule } from '@nestjs/testing';
import { RoutesService } from './routes.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('RoutesService', () => {
  let service: RoutesService;
  let prisma: PrismaService;

  const mockPrisma = {
    route: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RoutesService>(RoutesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all routes ordered by createdAt desc', async () => {
      const mockRoutes = [
        { id: '1', name: 'Route A', origin: 'City A', destination: 'City B', price: 1000, isActive: true },
        { id: '2', name: 'Route B', origin: 'City C', destination: 'City D', price: 2000, isActive: true },
      ];
      mockPrisma.route.findMany.mockResolvedValue(mockRoutes);

      const result = await service.findAll();

      expect(mockPrisma.route.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockRoutes);
    });
  });

  describe('findOne', () => {
    it('should return a route with trips', async () => {
      const mockRoute = {
        id: '1',
        name: 'Route A',
        origin: 'City A',
        destination: 'City B',
        trips: [],
      };
      mockPrisma.route.findUnique.mockResolvedValue(mockRoute);

      const result = await service.findOne('1');

      expect(mockPrisma.route.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { trips: true },
      });
      expect(result).toEqual(mockRoute);
    });
  });

  describe('create', () => {
    it('should create a route with isActive true', async () => {
      const createData = {
        name: 'New Route',
        origin: 'Origin',
        destination: 'Destination',
        price: 1500,
        distance: 300,
        duration: 240,
      };
      const createdRoute = { id: 'new-id', ...createData, isActive: true };
      mockPrisma.route.create.mockResolvedValue(createdRoute);

      const result = await service.create(createData);

      expect(mockPrisma.route.create).toHaveBeenCalledWith({
        data: { ...createData, isActive: true },
      });
      expect(result).toEqual(createdRoute);
    });
  });

  describe('update', () => {
    it('should update a route', async () => {
      const updatedRoute = { id: '1', name: 'Updated Route', price: 2000 };
      mockPrisma.route.update.mockResolvedValue(updatedRoute);

      const result = await service.update('1', { name: 'Updated Route', price: 2000 });

      expect(mockPrisma.route.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated Route', price: 2000 },
      });
      expect(result).toEqual(updatedRoute);
    });
  });

  describe('remove', () => {
    it('should soft delete a route by setting isActive to false', async () => {
      const deletedRoute = { id: '1', isActive: false };
      mockPrisma.route.update.mockResolvedValue(deletedRoute);

      const result = await service.remove('1');

      expect(mockPrisma.route.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isActive: false },
      });
      expect(result).toEqual(deletedRoute);
    });
  });

  describe('search', () => {
    it('should search routes by origin and destination (case insensitive)', async () => {
      const mockResults = [
        { id: '1', name: 'Москва - Санкт-Петербург', origin: 'Москва', destination: 'Санкт-Петербург' },
      ];
      mockPrisma.route.findMany.mockResolvedValue(mockResults);

      const result = await service.search('Москва', 'Санкт');

      expect(mockPrisma.route.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            { origin: { contains: 'Москва', mode: 'insensitive' } },
            { destination: { contains: 'Санкт', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockResults);
    });
  });
});
