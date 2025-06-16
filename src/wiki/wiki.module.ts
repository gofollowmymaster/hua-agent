import { Module } from '@nestjs/common';
import { WikiController } from './wiki.controller';
import { WikiService } from './wiki.service';
import { PrismaService } from '@src/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { FeishuHelperModule } from '@src/common/feishu/hepler/helper.module';

// import { FeishuTableModule } from '@src/common/feishu/table/table.module';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';

@Module({
  imports: [
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AilyAplusClient)),
    // FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AlertClient)),

    // FeishuTableModule,
  ],
  controllers: [WikiController],
  providers: [WikiService, PrismaService, LoggerService],
  exports: [WikiService],
})
export class AilyWikiModule {}
