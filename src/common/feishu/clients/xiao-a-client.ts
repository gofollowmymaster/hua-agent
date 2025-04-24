import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { ConfigService } from '@nestjs/config';

@Injectable()
class XiaoAClient extends FeishuClient {
  // private readonly instance;

  constructor(config?: ConfigService) {
    const XiaoAAppId = config.get('XiaoAAppId');
    const XiaoAAppSecret = config.get('XiaoAAppSecret');
    super(XiaoAAppId, XiaoAAppSecret);
  }
}

export default XiaoAClient;
