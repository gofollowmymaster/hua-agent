import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { FeishuAppClientsType } from '.';

@Injectable()
class AplusNavClient extends FeishuClient {
  // private readonly instance;

  constructor() {
    super(AplusNavClient.name as FeishuAppClientsType);
  }
}

export default AplusNavClient;
