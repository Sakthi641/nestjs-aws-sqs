import { Controller, Post, Body, Get } from '@nestjs/common';
import { SqsService } from './sqs.service';

@Controller('sqs')
export class SqsController {
  constructor(private readonly sqsService: SqsService) {}

  @Post('send')
  async sendMessage(@Body('message') message: string) {
    const messageId = await this.sqsService.sendMessage(message);
    return { messageId };
  }

  @Get('receive')
  async receiveMessage() {
    const message = await this.sqsService.receiveMessage();
    if (message) {
      await this.sqsService.deleteMessage(message.ReceiptHandle);
    }
    return message;
  }
}
