import { Module } from '@nestjs/common';
import { MtableController } from './mtable/mtable.controller';
import { HttpModule } from '@nestjs/axios';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import { FeishuHelperModule } from '@src/common/feishu/hepler/helper.module';
import { PrismaService } from '@src/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import AdminMtableTable from './mtable/table/mtable-table';
import { MtableService } from './mtable/mtable.service';
import { CacheController } from './cache/cache.controller';
import { CacheService } from './cache/cache.service';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';

@Module({
  imports: [
    HttpModule,
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AlertClient)),
  ],
  providers: [
    CacheService,
    MtableService,
    PrismaService,
    LoggerService,
    AdminMtableTable,
    FeishuBusinessLineTable,
  ],
  controllers: [MtableController, CacheController],
})
export class AdminModule {}
