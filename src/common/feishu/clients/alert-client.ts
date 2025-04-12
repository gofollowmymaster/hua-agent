import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { ConfigService } from '@nestjs/config';

@Injectable()
class FeishuAlertClient extends FeishuClient {
  // private readonly instance;

  constructor(private config?: ConfigService) {
    const AlertAppId = config.get('AlertAppId');
    const AlertAppSecret = config.get('AlertAppSecret');
    console.log('[ AlertAppId ] >', AlertAppId);
    console.log('[ AlertAppSecret ] >', AlertAppSecret);
    super('cli_a7c7e073b579500e', 'M8jpmdjcb8wvAxjU2Wlk2cULx0Cobeap');

    // super(AlertAppId, AlertAppSecret);
    // if (this.instance) return this.instance;
  }
}

export default FeishuAlertClient;
