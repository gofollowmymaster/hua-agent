import { Module } from '@nestjs/common';
import { SupplierDiffController } from './supplier-diff/supplier-diff.controller';
import { SupplierDiffService } from './supplier-diff/supplier-diff.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { FeishuHelperModule } from '@src/common/feishu/helper/helper.module';

import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import SupplierDiffTable from './common/table/supplier-diff.table';
import TrackingMetadataTable from './common/table/tracking-metadata.table';
import { SensitiveWordController } from './sensitive-word/sensitive-word.controller';
import { SensitiveWordService } from './sensitive-word/sensitive-word.service';
import { DocModule } from '@src/doc/doc.module';
import { TrackingMetadataController } from './tracking-metadata/controller/tracking-metadata.controller';
import { TrackingMetadataService } from './tracking-metadata/service/tracking-metadata.service';

@Module({
  imports: [
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.XiaoAClient)),
    DocModule,
  ],
  controllers: [
    SupplierDiffController,
    SensitiveWordController,
    TrackingMetadataController,
  ],
  providers: [
    SupplierDiffService,
    SensitiveWordService,
    LoggerService,
    SupplierDiffTable,
    TrackingMetadataTable,
    TrackingMetadataService,
  ],
  exports: [SupplierDiffService, SensitiveWordService],
})
export class ManageModule {}
