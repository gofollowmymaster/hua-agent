import { Module } from '@nestjs/common';
import { FeishuApp } from '@src/common/feishu/clients/enum';
import { FeishuHelperModule } from '../hepler/helper.module';
import FeishuApiAlertTable from './api-alert-table';
import FeishuFrontendAlertTable from './frontend-alert-table';
import FeishuBusinessLineTable from './business-line-table';
import { ClientFactory } from '../clients';
@Module({
  imports: [
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AlertClient)),
  ],
  providers: [
    FeishuApiAlertTable,
    FeishuFrontendAlertTable,
    FeishuBusinessLineTable,
  ],
  exports: [
    FeishuApiAlertTable,
    FeishuFrontendAlertTable,
    FeishuBusinessLineTable,
  ],
})
export class FeishuTableModule {}
