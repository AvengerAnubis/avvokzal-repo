import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('api/bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Get()
  async findAll(@Query('userId') userId?: string) {
    return this.bookingsService.findAll(userId);
  }

  @Get('user/:userId')
  async getByUser(@Param('userId') userId: string) {
    return this.bookingsService.getByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Post()
  async create(@Body() body: {
    userId: string;
    tripId: string;
    seats: number;
    passengerName?: string;
    passengerPhone?: string;
  }) {
    return this.bookingsService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<{
      seats: number;
      status: any;
      passengerName: string;
      passengerPhone: string;
    }>,
  ) {
    return this.bookingsService.update(id, body);
  }

  @Put(':id/confirm')
  async confirm(@Param('id') id: string) {
    return this.bookingsService.confirm(id);
  }

  @Put(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}