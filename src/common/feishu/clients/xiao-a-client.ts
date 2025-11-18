import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { FeishuAppClentsType } from '.';

@Injectable()
class XiaoAClient extends FeishuClient {
  constructor() {
    super(XiaoAClient.name as FeishuAppClentsType);
  }
}

export default XiaoAClient;
