import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { FeishuAppClentsType } from '.';
@Injectable()
class AiHeplerClient extends FeishuClient {
  constructor() {
    super(AiHeplerClient.name as FeishuAppClentsType);
  }
}

export default AiHeplerClient;
