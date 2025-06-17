import { Module } from '@nestjs/common';
import { LogOperatorController } from './log-operator.controller';
import { LogOperatorService } from './log-operator.service';
import { PrismaService } from '@src/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { FeishuHelperModule } from '@src/common/feishu/hepler/helper.module';

// import { FeishuTableModule } from '@src/common/feishu/table/table.module';
import LogOperatorAdapter from './adapter/log-operator-adapter';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import AilyLogOperatorTable from './adapter/aily-log-operator-table';

@Module({
  imports: [
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AilyAplusClient)),
  ],
  controllers: [LogOperatorController],
  providers: [
    AilyLogOperatorTable,

    LogOperatorService,
    PrismaService,
    LoggerService,
    LogOperatorAdapter,
  ],
  exports: [LogOperatorService],
})
export class AilyLogOperatorModule {}
