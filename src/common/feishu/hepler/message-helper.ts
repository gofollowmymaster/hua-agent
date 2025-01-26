import FeishuClient from '../clients/client';
// import { ConfigService } from '@nestjs/config';
import { FEISHU_CLIENT_ID } from './constants';
import { Inject } from '@nestjs/common';

class FeishuMessageHelper {
  constructor(
    // private readonly config: ConfigService,
    @Inject(FEISHU_CLIENT_ID) private readonly client: FeishuClient,
  ) {}
  create(content, feishuGroupId) {
    console.log('[ feishuGroupId ] >', feishuGroupId);
    return this.client.client.im.message.create({
      data: {
        receive_id: feishuGroupId,
        msg_type: 'interactive',
        content,
      },
      params: {
        receive_id_type: 'chat_id',
      },
    });
  }
}

export default FeishuMessageHelper;
