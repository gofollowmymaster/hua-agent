import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import { FeishuHelperModule } from '@src/common/feishu/helper/helper.module';
import FeishuBusinessLineTable from './business-line-table';
import ClientSecretTable from './client-secret-table';

@Module({
  imports: [
    HttpModule,
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AilyAplusClient)),
  ],
  providers: [FeishuBusinessLineTable, ClientSecretTable],
})
export class BaseTableModule {}
