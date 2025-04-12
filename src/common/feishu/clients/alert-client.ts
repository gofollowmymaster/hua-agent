import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { ConfigService } from '@nestjs/config';

@Injectable()
class FeishuAlertClient extends FeishuClient {
  // private readonly instance;

  constructor(config?: ConfigService) {
    const AlertAppId = config.get('AlertAppId');
    const AlertAppSecret = config.get('AlertAppSecret');
    super(AlertAppId, AlertAppSecret);
  }
}

export default FeishuAlertClient;
