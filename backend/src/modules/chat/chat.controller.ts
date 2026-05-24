import { Controller, Get, Post, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  // Driver creates a new chat or reuses existing one
  @Post()
  async create(@Body() body: { driverId: string; text: string }) {
    return this.chatService.create(body.driverId, body.text);
  }

  // Driver heartbeat (every 10s from client)
  @Post(':id/heartbeat')
  async heartbeat(@Param('id') id: string) {
    return this.chatService.heartbeat(id);
  }

  // List available chats needing an operator
  @Get('available')
  async getAvailable() {
    return this.chatService.getAvailable();
  }

  // Assign operator to chat
  @Post(':id/assign')
  async assign(@Param('id') id: string, @Body() body: { operatorId: string }) {
    return this.chatService.assign(id, body.operatorId);
  }

  // Send a message
  @Post(':id/message')
  async sendMessage(
    @Param('id') id: string,
    @Body() body: { senderId: string; senderRole: 'DRIVER' | 'OPERATOR' | 'ADMIN'; text: string },
  ) {
    return this.chatService.sendMessage(id, body.senderId, body.senderRole, body.text);
  }

  // Get messages for a chat
  @Get(':id/messages')
  async getMessages(@Param('id') id: string) {
    return this.chatService.getMessages(id);
  }

  // Close a chat
  @Post(':id/close')
  async close(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.chatService.close(id, body.userId);
  }

  // Get chat history for the current user
  @Get('history')
  async getHistory(@Query('userId') userId: string, @Query('role') role: string) {
    return this.chatService.getHistory(userId, role);
  }

  // Get single chat with messages
  @Get(':id')
  async getById(@Param('id') id: string, @Query('userId') userId: string, @Query('role') role: string) {
    return this.chatService.getById(id, userId, role);
  }

  // Get operator's active chats
  @Get('active/operator')
  async getActiveByOperator(@Query('operatorId') operatorId: string) {
    return this.chatService.getActiveByOperator(operatorId);
  }

  // Get driver's active chat
  @Get('active/driver')
  async getDriverActiveChat(@Query('driverId') driverId: string) {
    return this.chatService.getDriverActiveChat(driverId);
  }
}