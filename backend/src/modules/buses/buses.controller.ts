import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BusesService } from './buses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/buses')
export class BusesController {
  constructor(private busesService: BusesService) {}

  @Get()
  async findAll() {
    return this.busesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.busesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: { plateNumber: string; model?: string; totalSeats?: number }) {
    return this.busesService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: { plateNumber?: string; model?: string; totalSeats?: number; isActive?: boolean }) {
    return this.busesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.busesService.remove(id);
  }
}
