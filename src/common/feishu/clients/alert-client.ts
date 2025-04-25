import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { ConfigService } from '@nestjs/config';

@Injectable()
class FeishuAlertClient extends FeishuClient {
  // private readonly instance;

  constructor(config?: ConfigService) {
    const AlertAppId = config?.get('AlertAppId') || 'cli_a7c7e073b579500e';
    const AlertAppSecret =
      config?.get('AlertAppSecret') || 'M8jpmdjcb8wvAxjU2Wlk2cULx0Cobeap';
    super(AlertAppId, AlertAppSecret);
  }
}

export default FeishuAlertClient;
