import { Module } from '@nestjs/common';
import { SentryWebhookController } from './webhook.controller';
import { SentryWebhookService } from './webhook.service';
import { PrismaService } from '@src/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
@Module({
  controllers: [SentryWebhookController],
  providers: [SentryWebhookService, PrismaService, LoggerService],
  exports: [SentryWebhookService],
})
export class SentryWebhookModule {}
