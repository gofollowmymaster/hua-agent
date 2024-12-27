import { Module } from '@nestjs/common';
import { AlertMsgController } from './alert-message.controller';
import { AlertMsgService } from './alert-message.service';
import { PrismaService } from '@src/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
@Module({
  controllers: [AlertMsgController],
  providers: [AlertMsgService, PrismaService, LoggerService],
  exports: [AlertMsgService],
})
export class AlertMsgModule {}
