import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { DelaysService } from './delays.service';

@Controller('api/delays')
export class DelaysController {
  constructor(private delaysService: DelaysService) {}

  @Get()
  async findAll(@Query('tripId') tripId?: string) {
    return this.delaysService.findAll(tripId);
  }

  @Get('all')
  async getAllWithTrips() {
    return this.delaysService.getAllWithTrips();
  }

  @Get('trip/:tripId')
  async getByTrip(@Param('tripId') tripId: string) {
    return this.delaysService.getByTrip(tripId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.delaysService.findOne(id);
  }

  @Post()
  async create(@Body() body: {
    tripId: string;
    reason?: string;
    delayMinutes: number;
  }) {
    return this.delaysService.create(body);
  }
}