import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { FeishuAppClentsType } from '.';
@Injectable()
class AiAlertClient extends FeishuClient {
  constructor() {
    super(AiAlertClient.name as FeishuAppClentsType);
  }
}

export default AiAlertClient;
