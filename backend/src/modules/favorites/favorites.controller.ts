import { Controller, Get, Post, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.favoritesService.findAll(req.user.userId);
  }

  @Post()
  async add(@Req() req: any, @Body() body: { routeId: string }) {
    return this.favoritesService.add(req.user.userId, body.routeId);
  }

  @Delete()
  async remove(@Req() req: any, @Body() body: { routeId: string }) {
    return this.favoritesService.remove(req.user.userId, body.routeId);
  }

  @Get('check/:routeId')
  async isFavorite(@Req() req: any, @Param('routeId') routeId: string) {
    return this.favoritesService.isFavorite(req.user.userId, routeId);
  }
}