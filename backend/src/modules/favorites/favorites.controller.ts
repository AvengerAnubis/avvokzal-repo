import { Controller, Get, Post, Delete, Param, Query } from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('api/favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  async findAll(@Query('userId') userId: string) {
    return this.favoritesService.findAll(userId);
  }

  @Post(':routeId')
  async add(@Query('userId') userId: string, @Param('routeId') routeId: string) {
    return this.favoritesService.add(userId, routeId);
  }

  @Delete(':routeId')
  async remove(@Query('userId') userId: string, @Param('routeId') routeId: string) {
    return this.favoritesService.remove(userId, routeId);
  }

  @Get('check/:routeId')
  async isFavorite(@Query('userId') userId: string, @Param('routeId') routeId: string) {
    return this.favoritesService.isFavorite(userId, routeId);
  }
}