import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { QuotesService } from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(private service: QuotesService) {}

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Post(':id/convert')
  convertToInvoice(@Param('id') id: string, @Body('userId') userId: string) {
    return this.service.convertToInvoice(id, userId);
  }
}
