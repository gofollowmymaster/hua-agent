import { Module } from '@nestjs/common';
import { VerifyService } from './verify.service';
import { SubappController } from './verify.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SubappController],
  providers: [VerifyService, PrismaService],
})
export class VerifyModule {}
