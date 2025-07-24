import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import { FeishuHelperModule } from '@src/common/feishu/hepler/helper.module';
import { LoggerService } from '@src/common/service/logger/logger.service';

@Module({
  imports: [
    HttpModule,
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AilyAplusClient)),
  ],
  providers: [],
})
export class AiModule {}
