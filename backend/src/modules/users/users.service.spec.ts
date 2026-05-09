import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users without role filter', async () => {
      const mockUsers = [
        { id: '1', email: 'test1@test.com', firstName: 'Test1', lastName: 'User1', role: UserRole.USER, isActive: true },
        { id: '2', email: 'test2@test.com', firstName: 'Test2', lastName: 'User2', role: UserRole.ADMIN, isActive: true },
      ];
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: undefined,
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockUsers);
    });

    it('should return users filtered by role', async () => {
      const mockDrivers = [
        { id: '1', email: 'driver@test.com', firstName: 'Driver', lastName: 'One', role: UserRole.DRIVER, isActive: true },
      ];
      mockPrisma.user.findMany.mockResolvedValue(mockDrivers);

      const result = await service.findAll(UserRole.DRIVER);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { role: UserRole.DRIVER },
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockDrivers);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.USER,
        isActive: true,
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createData = {
      email: 'new@test.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      phone: '+79000000000',
      role: UserRole.DRIVER,
    };

    it('should create a user with hashed password', async () => {
      const createdUser = {
        id: 'new-id',
        email: createData.email,
        firstName: createData.firstName,
        lastName: createData.lastName,
        role: createData.role,
        isActive: true,
      };
      mockPrisma.user.create.mockResolvedValue(createdUser);

      const result = await service.create(createData);

      expect(bcrypt.hash).toHaveBeenCalledWith(createData.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: createData.email,
          password: expect.any(String),
          firstName: createData.firstName,
          lastName: createData.lastName,
          phone: createData.phone,
          role: createData.role,
        },
        select: expect.any(Object),
      });
      expect(result).toEqual(createdUser);
    });

    it('should default role to USER if not provided', async () => {
      mockPrisma.user.create.mockResolvedValue({ id: '1', role: UserRole.USER });

      await service.create({
        email: 'test@test.com',
        password: 'pass',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: UserRole.USER }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updatedUser = {
        id: '1',
        email: 'updated@test.com',
        firstName: 'Updated',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true,
      };
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', { email: 'updated@test.com', firstName: 'Updated' });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { email: 'updated@test.com', firstName: 'Updated' },
        select: expect.any(Object),
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should soft delete a user by setting isActive to false', async () => {
      const deletedUser = { id: '1', isActive: false };
      mockPrisma.user.update.mockResolvedValue(deletedUser);

      const result = await service.remove('1');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isActive: false },
      });
      expect(result).toEqual(deletedUser);
    });
  });

  describe('getDrivers', () => {
    it('should return active drivers', async () => {
      const drivers = [
        { id: '1', email: 'driver@test.com', firstName: 'Driver', lastName: 'One', phone: '+79000000000' },
      ];
      mockPrisma.user.findMany.mockResolvedValue(drivers);

      const result = await service.getDrivers();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { role: UserRole.DRIVER, isActive: true },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true },
      });
      expect(result).toEqual(drivers);
    });
  });

  describe('getOperators', () => {
    it('should return active operators', async () => {
      const operators = [
        { id: '1', email: 'operator@test.com', firstName: 'Operator', lastName: 'One', phone: '+79000000000' },
      ];
      mockPrisma.user.findMany.mockResolvedValue(operators);

      const result = await service.getOperators();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { role: UserRole.OPERATOR, isActive: true },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true },
      });
      expect(result).toEqual(operators);
    });
  });

  describe('getAdmins', () => {
    it('should return active admins', async () => {
      const admins = [
        { id: '1', email: 'admin@test.com', firstName: 'Admin', lastName: 'One', phone: '+79000000000' },
      ];
      mockPrisma.user.findMany.mockResolvedValue(admins);

      const result = await service.getAdmins();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { role: UserRole.ADMIN, isActive: true },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true },
      });
      expect(result).toEqual(admins);
    });
  });
});
