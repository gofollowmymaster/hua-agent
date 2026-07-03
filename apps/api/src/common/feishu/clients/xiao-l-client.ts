import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { FeishuAppClientsType } from '.';

@Injectable()
class XiaoLClient extends FeishuClient {
  // private readonly instance;

  constructor() {
    super(XiaoLClient.name as FeishuAppClientsType);
  }
}

export default XiaoLClient;
