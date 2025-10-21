import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { ConfigService } from '@nestjs/config';

@Injectable()
class AiAlertClient extends FeishuClient {
  constructor(config?: ConfigService) {
    const AplusAilyAppId =
      config?.get('AilyAlertAppId') || process.env.FEISHU_AILY_ALERT_APP_ID;
    const AplusAilyAppSecret =
      config?.get('AilyAlertAppSecret') ||
      process.env.FEISHU_AILY_ALERT_APP_SECRET;

    super(AplusAilyAppId, AplusAilyAppSecret);
  }
}

export default AiAlertClient;
