import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let prisma: PrismaService;

  const mockPrisma = {
    favorite: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all favorites for a user with routes', async () => {
      const mockFavorites = [
        { id: '1', userId: 'u1', routeId: 'r1', route: { id: 'r1', name: 'Route A' } },
      ];
      mockPrisma.favorite.findMany.mockResolvedValue(mockFavorites);

      const result = await service.findAll('u1');

      expect(mockPrisma.favorite.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        include: { route: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockFavorites);
    });
  });

  describe('add', () => {
    it('should return existing favorite if already exists', async () => {
      const existing = { id: '1', userId: 'u1', routeId: 'r1' };
      mockPrisma.favorite.findUnique.mockResolvedValue(existing);

      const result = await service.add('u1', 'r1');

      expect(mockPrisma.favorite.create).not.toHaveBeenCalled();
      expect(result).toEqual(existing);
    });

    it('should create a new favorite if not exists', async () => {
      mockPrisma.favorite.findUnique.mockResolvedValue(null);
      const created = { id: 'new-id', userId: 'u1', routeId: 'r1', route: {} };
      mockPrisma.favorite.create.mockResolvedValue(created);

      const result = await service.add('u1', 'r1');

      expect(mockPrisma.favorite.create).toHaveBeenCalledWith({
        data: { userId: 'u1', routeId: 'r1' },
        include: { route: true },
      });
      expect(result).toEqual(created);
    });
  });

  describe('remove', () => {
    it('should delete a favorite by userId and routeId', async () => {
      const deleted = { id: '1', userId: 'u1', routeId: 'r1' };
      mockPrisma.favorite.delete.mockResolvedValue(deleted);

      const result = await service.remove('u1', 'r1');

      expect(mockPrisma.favorite.delete).toHaveBeenCalledWith({
        where: { userId_routeId: { userId: 'u1', routeId: 'r1' } },
      });
      expect(result).toEqual(deleted);
    });
  });

  describe('isFavorite', () => {
    it('should return true if favorite exists', async () => {
      mockPrisma.favorite.findUnique.mockResolvedValue({ id: '1' });

      const result = await service.isFavorite('u1', 'r1');

      expect(result).toEqual({ isFavorite: true });
    });

    it('should return false if favorite does not exist', async () => {
      mockPrisma.favorite.findUnique.mockResolvedValue(null);

      const result = await service.isFavorite('u1', 'r1');

      expect(result).toEqual({ isFavorite: false });
    });
  });
});
