import { Module } from '@nestjs/common';
import { AilyService } from './aily/aily.service';
import { AilyController } from './aily/aily.controller';
import { LogOperatorService } from './log-operator/log-operator.service';
import { LogOperatorController } from './log-operator/log-operator.controller';
import { HttpModule } from '@nestjs/axios';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import { FeishuHelperModule } from '@src/common/feishu/helper/helper.module';
import AilyLogOperatorTable from './log-operator/adapter/aily-log-operator-table';
import { PrismaService } from '@src/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import LogOperatorAdapter from './log-operator/adapter/log-operator-adapter';
import FixedTokenService from './common/schedule/load-fixed-token';

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
    FixedTokenService,
  ],
  controllers: [AilyController, LogOperatorController],
})
export class AiModule {}
