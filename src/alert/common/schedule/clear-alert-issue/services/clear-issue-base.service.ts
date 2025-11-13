import { ConfigService } from '@nestjs/config';
import { BitTableFilter } from '@src/common/feishu/type/bitable';
import dayjs from 'dayjs';
import { Injectable } from '@nestjs/common';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import FeishuTable from '@src/common/feishu/table/feishu-table';

@Injectable()
export default class ClearAlertPerDayBaseService {
  protected businessLines: Record<string, any>[] = [];
  protected environment = process.env.NODE_ENV;
  protected name: string;
  protected readonly tableViews: Record<string, any>;
  constructor(
    protected readonly config: ConfigService,
    protected readonly feishuIssueTable: FeishuTable,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly businessLineTable: FeishuBusinessLineTable,
  ) {}

  async clear() {
    const towdayStart =
      dayjs().subtract(1, 'D').startOf('day').valueOf() - 60 * 1000;
    const filter: BitTableFilter = {
      conjunction: 'and',
      conditions: [
        {
          field_name: '最后更新时间',
          operator: 'isGreater',
          value: ['ExactDate', towdayStart + ''],
        },
        {
          field_name: '日错误次数',
          operator: 'isGreater',
          value: ['0'],
        },
        {
          field_name: '环境',
          operator: 'is',
          value: ['prod'],
        },
      ],
    };
    const { items: list } = await this.feishuIssueTable.search(
      filter,
      {
        page_size: 100,
      },
      false,
    );
    list.map((item) => {
      item.fields = {
        日错误次数: 0,
      };
    });
    console.log('[ list ] >', list);
    if (list.length < 1) return;

    const res = await this.feishuIssueTable.batchUpdate(list);
    console.log('[ res ] >', res);
    // console.log('[ requestIssueList ] >', JSON.stringify(requestIssueList));
  }
}
