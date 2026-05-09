import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('api/payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  async findAll(@Query('bookingId') bookingId?: string) {
    return this.paymentsService.findAll(bookingId);
  }

  @Get('booking/:bookingId')
  async findByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentsService.findByBooking(bookingId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  async create(@Body() body: {
    bookingId: string;
    amount: number;
    paymentMethod?: string;
  }) {
    return this.paymentsService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<{
      status: any;
      transactionId: string;
      paidAt: Date;
    }>,
  ) {
    return this.paymentsService.update(id, body);
  }

  @Post(':id/process')
  async process(@Param('id') id: string) {
    return this.paymentsService.process(id);
  }

  @Post(':id/refund')
  async refund(@Param('id') id: string) {
    return this.paymentsService.refund(id);
  }
}