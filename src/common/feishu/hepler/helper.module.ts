import { DynamicModule, Module } from '@nestjs/common';
// import FeishuAlertClient from '../alert-client';
// import FeishuClient from '../clients/client';
import FeishuMessageHelper from './message-helper';
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

            return client;
          },
          inject: [ConfigService],
        },
        FeishuMessageHelper,
      ],
      exports: [FeishuMessageHelper],
    };
  }
}
