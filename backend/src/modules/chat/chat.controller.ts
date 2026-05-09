import { Controller, Get, Post, Put, Param, Query, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('driver/:driverId')
  async getMessages(@Param('driverId') driverId: string) {
    return this.chatService.getMessages(driverId);
  }

  @Post()
  async sendMessage(@Body() body: { driverId: string; content: string }) {
    return this.chatService.sendMessage(body.driverId, body.content);
  }

  @Put(':messageId/read')
  async markAsRead(@Param('messageId') messageId: string) {
    return this.chatService.markAsRead(messageId);
  }

  @Get('driver/:driverId/unread')
  async getUnreadCount(@Param('driverId') driverId: string) {
    return this.chatService.getUnreadCount(driverId);
  }
}