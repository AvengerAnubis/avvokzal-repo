import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripStatus } from '@prisma/client';

@Controller('api/trips')
export class TripsController {
  constructor(private tripsService: TripsService) {}

  @Get()
  async findAll(@Query('routeId') routeId?: string) {
    return this.tripsService.findAll(routeId);
  }

  @Get('route/:routeId')
  async findByRoute(@Param('routeId') routeId: string) {
    return this.tripsService.findByRoute(routeId);
  }

  @Get('delayed')
  async getDelayed() {
    return this.tripsService.getDelayed();
  }

  @Get('driver/:driverId')
  async getByDriver(@Param('driverId') driverId: string) {
    return this.tripsService.getByDriver(driverId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Get(':id/seats')
  async getAvailableSeats(@Param('id') id: string) {
    return this.tripsService.getAvailableSeats(id);
  }

  @Post()
  async create(@Body() body: {
    routeId: string;
    departureTime: Date;
    arrivalTime: Date;
    busNumber?: string;
    busId?: string;
    driverId?: string;
    totalSeats?: number;
  }) {
    return this.tripsService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<{
      departureTime: Date;
      arrivalTime: Date;
      status: TripStatus;
      busNumber: string;
      driverId: string;
      operatorId: string;
    }>,
  ) {
    return this.tripsService.update(id, body);
  }

  @Put(':id/time')
  async updateTime(
    @Param('id') id: string,
    @Body() body: { departureTime: Date; arrivalTime: Date; operatorId: string },
  ) {
    return this.tripsService.updateTime(id, body.departureTime, body.arrivalTime, body.operatorId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tripsService.remove(id);
  }
}