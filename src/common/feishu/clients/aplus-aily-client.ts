import { Injectable } from '@nestjs/common';
import FeishuClient from './client';
import { ConfigService } from '@nestjs/config';

@Injectable()
class AilyAplusClient extends FeishuClient {
  // private readonly instance;

  constructor(config?: ConfigService) {
    console.log('[ AplusAilyAppSecret ] >', process.env.FEISHU_APP_ID);
    const AplusAilyAppId =
      config?.get('AplusAilyAppId') || 'cli_a7767c8cc874d00c';
    const AplusAilyAppSecret =
      config?.get('AplusAilyAppSecret') || 'eqI2bMqzr2c9mvdEwvqFAgpf20RJdktx';

    super(AplusAilyAppId, AplusAilyAppSecret);
  }
}

export default AilyAplusClient;
