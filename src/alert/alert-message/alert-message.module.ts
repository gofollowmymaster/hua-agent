import { Module } from '@nestjs/common';
import { AlertMsgController } from './alert-message.controller';
import { AlertMsgService } from './alert-message.service';
import { PrismaService } from '@src/prisma.service';
@Module({
  controllers: [AlertMsgController],
  providers: [AlertMsgService, PrismaService],
  exports: [AlertMsgService],
})
export class AlertMsgModule {}
