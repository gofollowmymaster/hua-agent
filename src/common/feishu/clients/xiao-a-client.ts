import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { ConfigService } from '@nestjs/config';

@Injectable()
class XiaoAClient extends FeishuClient {
  // private readonly instance;

  constructor(config?: ConfigService) {
    const XiaoAAppId = config?.get('XiaoAAppId') || 'cli_a7b9fe27a3f8d00e';
    const XiaoAAppSecret =
      config?.get('XiaoAAppSecret') || 'I7EAE1RyP9ClVfee2btuidKZarf8JHez';
    super(XiaoAAppId, XiaoAAppSecret);
  }
}

export default XiaoAClient;
