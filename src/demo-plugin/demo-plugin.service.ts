import { Injectable } from '@nestjs/common';
import { GenerateMidDto, VerifyMidDto } from './dto/generate-mid.dto';
import DemoPluginMidTable from './table/demo-plugin-mid-table';

import { buildUUID } from 'src/utils/uuid';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';

import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import { buildcommonCardMsg } from '@src/common/feishu/card/custom-card';

//过期时间
const EXPIRED_TIME = 1000 * 60 * 60 * 24;
@Injectable()
export class DemoPluginService {
  constructor(
    private readonly config: ConfigService,
    private readonly demoPluginMidTable: DemoPluginMidTable,
    private readonly messageHelper: FeishuMessageHelper,
  ) {}

  async generateMid(data: GenerateMidDto) {
    const { recordId } = data;
    const mid = buildUUID(24) + '&' + recordId;
    if (recordId) {
      const records = await this.demoPluginMidTable.update(recordId, {
        MId: mid,
      });
      console.log('[ records ] >', records);
    }

    return { mid };
  }
  async verify(data: VerifyMidDto) {
    let isValid = false;

    try {
      const filter = {
        conjunction: 'and',
        conditions: [
          {
            field_name: 'MId',
            operator: 'is',
            value: [data.MId],
          },
        ],
      };

      const records = await this.demoPluginMidTable.search(filter);
      if (records.length > 1) {
        sendExceptionToFeishu(new Error('MId 重复:' + data.MId), this.config);
      }
      if (records.length >= 1) {
        const { fields: info, record_id } = records[0];
        const current = dayjs().valueOf();
        const createdTime = info['创建时间'] as number;
        if (createdTime + EXPIRED_TIME > current) {
          //todo 即将过期提醒
          const userId = info['使用人']?.[0]?.id;
          console.log('[ userId ] >', userId);
          if (current - createdTime < 1000 * 60 * 60 && userId) {
            // this.messageHelper.createToUser({
            //   receive_id: userId,
            //   msg_type: 'text',
            //   content: buildcommonCardMsg(
            //     '提醒：MID即将过期',
            //     'MID: ' + info['MId'] + '即将过期',
            //   ),
            // });
          }
          isValid = true;
        } else if (info['状态'] !== '已失效') {
          await this.demoPluginMidTable.update(record_id, {
            状态: '已失效',
          });
        }
        if (info['状态'] == '未启用') {
          await this.demoPluginMidTable.update(record_id, {
            申请日期: current,
            状态: '使用中',
          });
        }
      }
    } catch (error) {
      // console.log('[ error ] >', error);
      sendExceptionToFeishu(error, this.config);
    }

    return {
      isValid,
    };
  }
}
