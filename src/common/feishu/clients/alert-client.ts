import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { FeishuAppClentsType } from '.';

@Injectable()
class FeishuAlertClient extends FeishuClient {
  // private readonly instance;

  constructor() {
    super(FeishuAlertClient.name as FeishuAppClentsType);
  }
}

export default FeishuAlertClient;
