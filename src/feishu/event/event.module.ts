import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { FeishuEventService } from './event.service';
import { PrismaService } from '@src/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
@Module({
  controllers: [EventController],
  providers: [FeishuEventService, PrismaService, LoggerService],
  exports: [FeishuEventService],
})
export class FeishuEventModule {}
