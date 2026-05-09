import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(@Query('role') role?: UserRole) {
    return this.usersService.findAll(role);
  }

  @Get('drivers/list')
  async getDrivers() {
    return this.usersService.getDrivers();
  }

  @Get('operators/list')
  async getOperators() {
    return this.usersService.getOperators();
  }

  @Get('admins/list')
  async getAdmins() {
    return this.usersService.getAdmins();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  async create(@Body() body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
  }) {
    return this.usersService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<{
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      role: UserRole;
      isActive: boolean;
    }>,
  ) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

}