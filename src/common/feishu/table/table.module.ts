import { Module } from '@nestjs/common';
import { FeishuApp } from '@src/common/feishu/clients/enum';
import { FeishuHelperModule } from '../hepler/helper.module';
import FeishuApiAlertTable from './api-alert-table';
import FeishuFrontendAlertTable from './frontend-alert-table';
@Module({
  imports: [FeishuHelperModule.forRoot(FeishuApp.AlertClient)],
  providers: [FeishuApiAlertTable, FeishuFrontendAlertTable],
  exports: [FeishuApiAlertTable, FeishuFrontendAlertTable],
})
export class FeishuTableModule {}
