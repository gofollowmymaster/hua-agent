import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { FeishuAppClientsType } from '.';
@Injectable()
class AiHelperClient extends FeishuClient {
  constructor() {
    super(AiHelperClient.name as FeishuAppClientsType);
  }
}

export default AiHelperClient;
