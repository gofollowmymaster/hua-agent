import { Module } from '@nestjs/common';
import { WikiController } from './wiki.controller';
import { WikiService } from './wiki.service';
import { PrismaService } from '@src/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { FeishuHelperModule } from '@src/common/feishu/hepler/helper.module';

import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import WikiDirectoryService from './schedule/wiki-directory';

@Module({
  imports: [
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AilyAplusClient)),
  ],
  controllers: [WikiController],
  providers: [WikiService, PrismaService, LoggerService, WikiDirectoryService],
  exports: [WikiService],
})
export class WikiModule {}
