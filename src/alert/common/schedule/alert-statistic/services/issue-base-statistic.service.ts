import { ConfigService } from '@nestjs/config';
import { BitTableFilter } from '@src/common/feishu/type/bitable';
import dayjs from 'dayjs';
import { Injectable } from '@nestjs/common';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import ErrorStatisticCard from '@src/common/feishu/card/error-statistic-card';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import FeishuTable from '@src/common/feishu/table/feishu-table';

const businessLines = ['商家运营', '仓储物流', '业财一体', '基础架构'];
const statusColorMap = {
  待处理: 'red',
  处理中: 'yellow',
  已解决: 'green',
  暂时忽略: 'blue',
  已关闭: 'green',
};

@Injectable()
export default class IssueStatisticService {
  protected busibessLines: Record<string, any>[] = [];
  protected environment = process.env.NODE_ENV;
  protected name: string;
  protected readonly tableViews: Record<string, any>;
  constructor(
    protected readonly config: ConfigService,
    protected readonly feishuIssueTable: FeishuTable,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly busibessLineTable: FeishuBusinessLineTable,
  ) {}
  getBusinessLineInfo(businessLine: string) {
    // const { pageModuleName, environment } = alertInfo;
    if (this.environment == 'dev' || this.environment == 'development') {
      return {
        groupId: this.config.getOrThrow('FeishuMsgDebugGroupId'),
        frontendLeader: this.config.getOrThrow('DefaultAlertFeishuUserId'),
      };
    }

    if (this.environment == 'uat' || this.environment == 'test') {
      // uat、test 环境使用的飞书群组
      return {
        groupId: 'oc_b69c0e3bf64478075363125e4fd32507',
        frontendLeader: this.config.getOrThrow('DefaultAlertFeishuUserId'),
      };
    }

    const line = this.busibessLines.find(({ fields }) => {
      return fields['业务线'] === businessLine;
    });
    return {
      groupId: line.fields['前端监控群'][0].id,
      frontendLeader: line.fields['前端leader'][0].id,
    };
  }
  async statistic() {
    const { items: list } = await this.busibessLineTable.list();
    this.busibessLines = list;
    businessLines.forEach(async (businessLine) => {
      const towdayStart = dayjs().startOf('day').valueOf();
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
          {
            field_name: '业务线',
            operator: 'is',
            value: [businessLine],
          },
        ],
      };
      const { items: requestIssueList } = await this.feishuIssueTable.search(
        filter,
        {
          page_size: 100,
        },
        false,
      );
      // console.log('[ requestIssueList ] >', JSON.stringify(requestIssueList));

      const tableData = requestIssueList.map(({ fields }) => {
        return {
          issueId: fields.IssueId[0].text,
          count: fields.日错误次数,
          userId: [fields.负责人[0].id],
          status: [
            {
              text: fields.状态,
              color: statusColorMap[fields.状态 + ''],
            },
          ],
          linkUrl: fields.level,
        };
      });

      const cardData = {
        total: requestIssueList.length,
        date: dayjs().format('YYYY-MM-DD') + this.name,
        resolved: requestIssueList.filter(
          (item) => item.fields.status === '已解决',
        ).length,
        ignored: requestIssueList.filter(
          (item) => item.fields.status === '暂时忽略',
        ).length,
        unresolved: requestIssueList.filter(
          (item) => !['已解决', '暂时忽略'].includes(item.fields['状态'] + ''),
        ).length,
        tableData,
        color: requestIssueList.length > 5 ? 'red' : 'yellow',
        link: this.tableViews[businessLine],
      };

      const message = ErrorStatisticCard.buildCardMsg(cardData);
      const lineInfo = this.getBusinessLineInfo(businessLine);
      console.log('[ lineInfo ] >', lineInfo);
      this.messageHelper.createInteractToGroup(message, lineInfo.groupId);
    });
  }
}
