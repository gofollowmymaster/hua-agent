import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { FeishuAppClientsType } from '.';

@Injectable()
class FeishuAlertClient extends FeishuClient {
  // private readonly instance;

  constructor() {
    super(FeishuAlertClient.name as FeishuAppClientsType);
  }
}

export default FeishuAlertClient;
