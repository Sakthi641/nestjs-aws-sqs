import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';

@Injectable()
export class SqsService {
  private sqsClient: SQSClient;
  private queueUrl: string;

  constructor(private configService: ConfigService) {
    this.sqsClient = new SQSClient({
      region: this.configService.get<string>('aws.region'),
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId'),
        secretAccessKey: this.configService.get<string>('aws.secretAccessKey'),
      },
    });
    this.queueUrl = this.configService.get<string>('sqs.queueUrl');
  }

  async sendMessage(message: string) {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: message,
    });

    try {
      const response = await this.sqsClient.send(command);
      return response.MessageId;
    } catch (error) {
      console.error('Error sending message to SQS: ', error);
      throw error;
    }
  }

  async receiveMessage() {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 1,
    });

    try {
      const response = await this.sqsClient.send(command);
      return response.Messages?.[0];
    } catch (error) {
      console.error('Error receiving message from SQS: ', error);
      throw error;
    }
  }

  async deleteMessage(receiptHandle: string) {
    const command = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    });

    try {
      await this.sqsClient.send(command);
    } catch (error) {
      console.error('Error deleting message from SQS: ', error);
      throw error;
    }
  }
}
