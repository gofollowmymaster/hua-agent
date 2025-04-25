import { DynamicModule, Module, Scope } from '@nestjs/common';
import FeishuMessageHelper from './message-helper';
import FeishuTableHelper from './table-helper';
import { FEISHU_CLIENT_ID } from './constants';
import { FeishuApp } from '../clients/enum';
import { ClientFactory } from '../clients';
import { ConfigService } from '@nestjs/config';
import FeishuClient from '../clients/client';

@Module({
  // providers: [FeishuAlertClient],
  // exports: [FeishuAlertClient],
})
export class FeishuHelperModule {
  static forRoot(client: FeishuClient): DynamicModule {
    // console.log('[ clientName ] >', clientName);
    return {
      module: FeishuHelperModule,
      providers: [
        {
          provide: FEISHU_CLIENT_ID,
          useValue: client,
        },
        {
          provide: FeishuMessageHelper,
          useClass: FeishuMessageHelper,
        },
        {
          provide: FeishuTableHelper,
          useClass: FeishuTableHelper,
        },
      ],
      exports: [FeishuMessageHelper, FeishuTableHelper],
    };
  }
}
