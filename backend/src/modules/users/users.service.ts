import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(role?: UserRole) {
    this.logger.log(`findAll${role ? ` (role: ${role})` : ''}`);
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    this.logger.log(`findOne (id: ${id})`);
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
  }) {
    this.logger.log(`create (email: ${data.email}, role: ${data.role || 'USER'})`);
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role || UserRole.USER,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, data: Partial<{
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRole;
    isActive: boolean;
  }>) {
    this.logger.log(`update (id: ${id})`);
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    this.logger.log(`remove (id: ${id}) [soft delete]`);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getDrivers() {
    this.logger.log('getDrivers');
    return this.prisma.user.findMany({
      where: { role: UserRole.DRIVER, isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });
  }

  async getOperators() {
    this.logger.log('getOperators');
    return this.prisma.user.findMany({
      where: { role: UserRole.OPERATOR, isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });
  }

  async getAdmins() {
    this.logger.log('getAdmins');
    return this.prisma.user.findMany({
      where: { role: UserRole.ADMIN, isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });
  }
}