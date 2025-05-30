import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { ConfigService } from '@nestjs/config';

@Injectable()
class FeishuAlertClient extends FeishuClient {
  // private readonly instance;

  constructor(config?: ConfigService) {
    const AlertAppId =
      config?.get('AlertAppId') || process.env.FEISHU_ALERT_APP_APPID;
    const AlertAppSecret =
      config?.get('AlertAppSecret') || process.env.FEISHU_ALERT_APP_APPSECRET;
    super(AlertAppId, AlertAppSecret);
  }
}

export default FeishuAlertClient;
