import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService, RegisterDto, TokenPayload } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '+79000000000',
    };

    it('should throw ConflictException if user already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: registerDto.email });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('should create a new user and return token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: 'USER',
      });
      mockJwtService.sign.mockReturnValue('fake-jwt-token');

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: expect.any(String),
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          phone: registerDto.phone,
          role: 'USER',
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: registerDto.email,
        role: 'USER',
      });
      expect(result).toEqual({
        access_token: 'fake-jwt-token',
        user: {
          id: 'user-1',
          email: registerDto.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          role: 'USER',
        },
      });
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-1',
      email: loginDto.email,
      password: 'hashed-password',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      isActive: true,
    };

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return token and user on successful login', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('fake-jwt-token');

      const result = await service.login(loginDto);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: loginDto.email,
        role: 'USER',
      });
      expect(result).toEqual({
        access_token: 'fake-jwt-token',
        user: {
          id: 'user-1',
          email: loginDto.email,
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
        },
      });
    });
  });

  describe('validateToken', () => {
    it('should return valid: false for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.validateToken('invalid-token');

      expect(result).toEqual({ valid: false });
    });

    it('should return valid: false if user not found', async () => {
      mockJwtService.verify.mockReturnValue({ sub: '1', email: 'test@test.com', role: 'USER' });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.validateToken('valid-token');

      expect(result).toEqual({ valid: false });
    });

    it('should return valid: false if user is inactive', async () => {
      mockJwtService.verify.mockReturnValue({ sub: '1', email: 'test@test.com', role: 'USER' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', isActive: false });

      const result = await service.validateToken('valid-token');

      expect(result).toEqual({ valid: false });
    });

    it('should return valid: true with user payload for active user', async () => {
      const payload: TokenPayload = { sub: '1', email: 'test@test.com', role: 'USER' };
      mockJwtService.verify.mockReturnValue(payload);
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', isActive: true });

      const result = await service.validateToken('valid-token');

      expect(result).toEqual({ valid: true, user: payload });
    });
  });

  describe('getProfile', () => {
    it('should throw BadRequestException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(BadRequestException);
    });

    it('should return user profile', async () => {
      const mockProfile = {
        id: '1',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '+79000000000',
        role: 'USER',
        createdAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockProfile);

      const result = await service.getProfile('1');

      expect(result).toEqual(mockProfile);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
    });
  });
});
