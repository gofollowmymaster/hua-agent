import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { FeishuAppClientsType } from '.';

@Injectable()
class AlertClient extends FeishuClient {
  // private readonly instance;

  constructor() {
    super(AlertClient.name as FeishuAppClientsType);
  }
}

export default AlertClient;
