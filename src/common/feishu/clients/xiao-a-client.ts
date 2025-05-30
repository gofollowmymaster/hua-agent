import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { ConfigService } from '@nestjs/config';

@Injectable()
class XiaoAClient extends FeishuClient {
  // private readonly instance;

  constructor(config?: ConfigService) {
    const XiaoAAppId = config?.get('XiaoAAppId') || process.env.FEISHU_APP_ID;
    const XiaoAAppSecret =
      config?.get('XiaoAAppSecret') || process.env.FEISHU_APP_SECRET;
    super(XiaoAAppId, XiaoAAppSecret);
  }
}

export default XiaoAClient;
