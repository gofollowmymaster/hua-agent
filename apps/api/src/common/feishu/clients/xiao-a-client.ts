import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { FeishuAppClientsType } from '.';

@Injectable()
class XiaoAClient extends FeishuClient {
  constructor() {
    super(XiaoAClient.name as FeishuAppClientsType);
  }
}

export default XiaoAClient;
