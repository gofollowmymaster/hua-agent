import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { FeishuAppClentsType } from '.';

@Injectable()
class AilyAplusClient extends FeishuClient {
  // private readonly instance;

  constructor() {
    super(AilyAplusClient.name as FeishuAppClentsType);
  }
}

export default AilyAplusClient;
