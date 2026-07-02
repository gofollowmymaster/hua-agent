import { Module } from '@nestjs/common';
import { AilyService } from './aily/aily.service';
import { AilyController } from './aily/aily.controller';
import { LogOperatorService } from './log-operator/log-operator.service';
import { LogOperatorController } from './log-operator/log-operator.controller';
import { HttpModule } from '@nestjs/axios';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import { FeishuHelperModule } from '@src/common/feishu/helper/helper.module';
import AilyLogOperatorTable from './log-operator/adapter/aily-log-operator-table';
import { PrismaService } from '@src/common/service/prisma/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import LogOperatorAdapter from './log-operator/adapter/log-operator-adapter';
import WikiFixedTokenService from '@src/common/service/fixed-user-token/wiki-fixed-user-token';
import { RagController } from './rag/rag.controller';
import { RagService } from './rag/rag.service';
import { RagDatabaseService } from './rag/services/rag-database.service';
import { DocumentLoaderService } from './rag/services/document-loader.service';
import { WecomRagBotService } from './rag/wecom-rag-bot.service';

@Module({
  imports: [
    HttpModule,
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AilyAplusClient)),
  ],
  providers: [
    AilyService,
    AilyLogOperatorTable,
    LogOperatorService,
    PrismaService,
    LoggerService,
    LogOperatorAdapter,
    WikiFixedTokenService,
    RagService,
    RagDatabaseService,
    DocumentLoaderService,
    WecomRagBotService,
  ],
  controllers: [AilyController, LogOperatorController, RagController],
})
export class AiModule {}
