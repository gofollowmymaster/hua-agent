import { Module } from '@nestjs/common';
import { DemoPluginService } from './demo-plugin.service';
import { DemoPluginController } from './demo-plugin.controller';
import { PrismaService } from '../prisma.service';
import DemoPluginMidTable from './table/demo-plugin-mid-table';
import { FeishuHelperModule } from '@src/common/feishu/helper/helper.module';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';

@Module({
  imports: [
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AilyAplusClient)),
  ],
  controllers: [DemoPluginController],
  providers: [DemoPluginService, PrismaService, DemoPluginMidTable],
})
export class DemoPluginModule {}
