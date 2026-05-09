import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Get()
  async findAll() {
    return this.routesService.findAll();
  }

  @Get('search')
  async search(@Query('origin') origin: string, @Query('destination') destination: string) {
    return this.routesService.search(origin, destination);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: {
    name: string;
    description?: string;
    origin: string;
    destination: string;
    distance?: number;
    duration?: number;
    price: number;
  }) {
    return this.routesService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() body: Partial<{
      name: string;
      description: string;
      origin: string;
      destination: string;
      distance: number;
      duration: number;
      price: number;
      isActive: boolean;
    }>,
  ) {
    return this.routesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.routesService.remove(id);
  }
}