import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { ConfigService } from '@nestjs/config';

@Injectable()
class AuthClient extends FeishuClient {
  // private readonly instance;

  constructor(config?: ConfigService) {
    const AlertAppId =
      config?.get('AplusAuthAppId') || process.env.FEISHU_AUTH_APP_ID;
    const AlertAppSecret =
      config?.get('AplusAuthAppSecret') || process.env.FEISHU_AUTH_APP_SECRET;
    super(AlertAppId, AlertAppSecret);
  }
}

export default AuthClient;
