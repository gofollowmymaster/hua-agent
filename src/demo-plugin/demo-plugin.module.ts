import { Module } from '@nestjs/common';
import { DemoPluginService } from './demo-plugin.service';
import { DemoPluginController } from './demo-plugin.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DemoPluginController],
  providers: [DemoPluginService, PrismaService],
})
export class DemoPluginModule {}
