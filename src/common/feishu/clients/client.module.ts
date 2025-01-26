import { Module } from '@nestjs/common';
import FeishuAlertClient from './alert-client';
import { ConfigService } from '@nestjs/config';
@Module({})
export class FeishuClientModule {
  forRoot() {
    return {
      providers: [
        {
          provide: FeishuAlertClient,
          useClass: FeishuAlertClient,
          inject: ConfigService,
        },
      ],
      exports: [FeishuAlertClient],
    };
  }
}
