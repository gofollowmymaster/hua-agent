import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { AliController } from './ali/ali.controller';
import { AliService } from './ali/ali.service';
import { DevopsApiService } from './ali/common/ali-api/ali-devops.helper';
import { AliCodeUpApiService } from './ali/common/ali-api/ali-codeup.helper';
import { DevopsOptionService } from './ali/common/service/devops-option.service';
import { FeishuHelperModule } from '@src/common/feishu/helper/helper.module';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import UserAliyunTable from './ali/common/table/user-token-table';
import { AliDevopsContext } from './ali/common/service/ali-devops.context';
import CancelExecutionServer from './ali/common/schedule/cancel-execution';

@Module({
  imports: [
    HttpModule,
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AiHeplerClient)),
  ],
  providers: [
    LoggerService,
    AliService,
    DevopsApiService,
    AliCodeUpApiService,
    DevopsOptionService,
    UserAliyunTable,
    AliDevopsContext,
    CancelExecutionServer,
  ],
  controllers: [AliController],
})
export class DevopsModule {}
