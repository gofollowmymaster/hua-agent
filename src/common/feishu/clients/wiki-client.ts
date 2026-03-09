import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { FeishuAppClientsType } from '.';

@Injectable()
class WikiClient extends FeishuClient {
  constructor() {
    super(WikiClient.name as FeishuAppClientsType);
  }
}

export default WikiClient;
