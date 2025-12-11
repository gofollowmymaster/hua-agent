import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { FeishuAppClientsType } from '.';

@Injectable()
class AilyAplusClient extends FeishuClient {
  // private readonly instance;

  constructor() {
    super(AilyAplusClient.name as FeishuAppClientsType);
  }
}

export default AilyAplusClient;
