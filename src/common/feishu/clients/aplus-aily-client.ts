import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { ConfigService } from '@nestjs/config';

@Injectable()
class AilyAplusClient extends FeishuClient {
  // private readonly instance;

  constructor(config?: ConfigService) {
    const AplusAilyAppId =
      config?.get('AplusAilyAppId') || process.env.FEISHU_AILY_APP_ID;
    const AplusAilyAppSecret =
      config?.get('AplusAilyAppSecret') || process.env.FEISHU_AILY_APP_SECRET;

    super(AplusAilyAppId, AplusAilyAppSecret);
  }
}

export default AilyAplusClient;
