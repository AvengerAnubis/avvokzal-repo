import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('api/tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get()
  async findAll(@Query('userId') userId?: string) {
    return this.ticketsService.findAll(userId);
  }

  @Get('booking/:bookingId')
  async findByBooking(@Param('bookingId') bookingId: string) {
    return this.ticketsService.findByBooking(bookingId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Post()
  async create(@Body() body: { bookingId: string; tripId: string; seatNumber: number }) {
    return this.ticketsService.create(body);
  }

  @Put(':id/used')
  async markAsUsed(@Param('id') id: string) {
    return this.ticketsService.markAsUsed(id);
  }

  @Post(':id/validate')
  async validate(@Param('id') id: string) {
    return this.ticketsService.validate(id);
  }
}