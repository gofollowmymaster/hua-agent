import { Injectable } from '@nestjs/common';
import { GenerateMidDto, VerifyMidDto } from './dto/generate-mid.dto';
import DemoPluginMidTable from './table/demo-plugin-mid-table';

import { buildUUID } from '@src/common/utils/uuid';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';

import dayjs from 'dayjs';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import { BitTableFilter } from '@src/common/feishu/type/bitable';

//过期时间
const EXPIRED_TIME = 1000 * 60 * 60 * 24;
@Injectable()
export class DemoPluginService {
  constructor(
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
      const filter: BitTableFilter = {
        conjunction: 'and',
        conditions: [
          {
            field_name: 'MId',
            operator: 'is',
            value: [data.MId],
          },
        ],
      };

      const { items: records } = await this.demoPluginMidTable.search(filter);
      if (records.length > 1) {
        sendExceptionToFeishu(new Error('MId 重复:' + data.MId));
      }
      if (records.length >= 1) {
        const { fields: info, record_id } = records[0];
        const current = dayjs().valueOf();
        // 未启用状态为第一次使用，则启用返回有效
        if (info['状态'] == '未启用') {
          await this.demoPluginMidTable.update(record_id, {
            申请日期: current,
            状态: '使用中',
          });
          isValid = true;
          return isValid;
        }

        const applyTime = info['申请日期'] as number;
        // 没有过期，返回有效
        if (applyTime + EXPIRED_TIME > current) {
          //todo 即将过期提醒
          const userId = info['使用人']?.[0]?.id;
          console.log('[ userId ] >', userId);
          if (current - applyTime < 1000 * 60 * 60 && userId) {
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
          return isValid;
        }
        //已过期 且状态非已失效，则更新状态为已失效
        if (info['状态'] !== '已失效') {
          await this.demoPluginMidTable.update(record_id, {
            状态: '已失效',
          });
        }
      }
    } catch (error) {
      console.log('[ error ] >', error);
      sendExceptionToFeishu(error);
    }
    console.log('[ info  fin ] >');
    return isValid;
  }
}
