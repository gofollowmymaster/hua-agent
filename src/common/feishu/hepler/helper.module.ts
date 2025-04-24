import { DynamicModule, Module } from '@nestjs/common';
import FeishuMessageHelper from './message-helper';
import FeishuTableHelper from './table-helper';
import { FEISHU_CLIENT_ID } from './constants';
import { FeishuApp } from '../clients/enum';
import { ClientFactory } from '../clients';
import { ConfigService } from '@nestjs/config';

@Module({
  // providers: [FeishuAlertClient],
  // exports: [FeishuAlertClient],
})
export class FeishuHelperModule {
  static forRoot(clientName: FeishuApp): DynamicModule {
    return {
      module: FeishuHelperModule,
      providers: [
        {
          provide: FEISHU_CLIENT_ID,
          // useValue: client,
          useFactory: async (config: ConfigService) => {
            // 在这里可以使用 configService 实例
            // const configValue = configService.get<string>('YOUR_CONFIG_KEY');
            const client = await ClientFactory.create(clientName, config);
            console.log('[ client ] >', clientName, client);
            return client;
          },
          inject: [ConfigService],
        },
        FeishuMessageHelper,
        FeishuTableHelper,
      ],
      exports: [FeishuMessageHelper, FeishuTableHelper],
    };
  }
}
