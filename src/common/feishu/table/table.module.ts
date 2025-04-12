import { Module } from '@nestjs/common';
import FeishuTable from './table';
import { FeishuApp } from '@src/common/feishu/clients/enum';
import { FeishuHelperModule } from '../hepler/helper.module';
@Module({
  imports: [FeishuHelperModule.forRoot(FeishuApp.AlertClient)],
  providers: [FeishuTable],
  exports: [FeishuTable],
})
export class FeishuTableModule {}
