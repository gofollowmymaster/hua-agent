import { BitTableFilter } from '@src/common/feishu/type/bitable';
import dayjs from 'dayjs';
import { Injectable } from '@nestjs/common';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import ErrorStatisticCard from '@src/common/feishu/card/error-statistic-card';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import FeishuTable from '@src/common/feishu/table/feishu-table';
import { wait } from '@src/common/utils/job';
import { ErrorEndpoint } from '@src/alert/common/type/alert';
import { NodeConfigService } from '@src/config/node-config.service';

const statusColorMap = {
  待处理: 'red',
  处理中: 'yellow',
  已解决: 'green',
  暂时忽略: 'blue',
  已关闭: 'green',
};

@Injectable()
export default class IssueStatisticService {
  protected businessLines: Record<string, any>[] = [];
  protected environment = process.env.NODE_ENV;
  protected errorEndpoint: ErrorEndpoint;
  protected readonly tableViews = {};
  constructor(
    protected readonly feishuIssueTable: FeishuTable,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly businessLineTable: FeishuBusinessLineTable,
  ) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected customFilter(item: Record<string, any>) {
    return true;
  }

  getBusinessLineInfo(businessLine: string) {
    // const { pageModuleName, environment } = alertInfo;
    if (this.environment == 'dev' || this.environment == 'development') {
      return {
        groupId: NodeConfigService.getOrThrow('FeishuMsgDebugGroupId'),
        frontendLeader: NodeConfigService.getOrThrow(
          'DefaultAlertFeishuUserId',
        ),
      };
    }

    if (this.environment == 'uat' || this.environment == 'test') {
      // uat、test 环境使用的飞书群组
      return {
        groupId: 'oc_b69c0e3bf64478075363125e4fd32507',
        frontendLeader: NodeConfigService.getOrThrow(
          'DefaultAlertFeishuUserId',
        ),
      };
    }

    const line = this.businessLines.find(({ fields }) => {
      return fields['业务线'] === businessLine;
    });
    return {
      groupId: line.fields['前端监控群'][0].id,
      frontendLeader: line.fields['前端leader'][0].id,
    };
  }
  async getIssuesToday(businessLine: string) {
    const todayStart = dayjs().startOf('day').valueOf();
    const filter: BitTableFilter = {
      conjunction: 'and',
      conditions: [
        {
          field_name: '最后更新时间',
          operator: 'isGreater',
          value: ['ExactDate', todayStart + ''],
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

    return this.getIssues(filter);
  }
  async dayStatistic() {
    const { items: list } = await this.businessLineTable.list();
    this.businessLines = list;

    for (const item of list) {
      const businessLine = item.fields['业务线'] as string;
      const requestIssueList = await this.getIssuesToday(businessLine);
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
        date:
          dayjs().format('YYYY-MM-DD') +
          (this.errorEndpoint == ErrorEndpoint.Page ? '前端' : '接口'),
        resolved: requestIssueList.filter(
          (item) => item.fields['状态'] === '已解决',
        ).length,
        ignored: requestIssueList.filter(
          (item) => item.fields['状态'] === '暂时忽略',
        ).length,
        unresolved: requestIssueList.filter(
          (item) => !['已解决', '暂时忽略'].includes(item.fields['状态'] + ''),
        ).length,
        tableData,
        color: requestIssueList.length > 5 ? 'red' : 'yellow',
        link: this.tableViews[businessLine],
        errorEndpoint: this.errorEndpoint,
        businessLine,
      };

      const message = ErrorStatisticCard.buildCardMsg(cardData);
      const lineInfo = this.getBusinessLineInfo(businessLine);
      this.messageHelper.createInteractToGroup(message, lineInfo.groupId);
      await wait(1000);
    }
  }

  async getIssues(filter: BitTableFilter) {
    const { items: requestIssueList } = await this.feishuIssueTable.search(
      { filter },
      {
        page_size: 100,
      },
      false,
    );
    return requestIssueList.filter(this.customFilter);
  }

  async pushIssueCardToUser(
    businessLine: string,
    userId: string,
    period: string,
  ) {
    period = period.slice(0, 10);
    const todayStart = dayjs(period).startOf('day').valueOf();

    const filter: BitTableFilter = {
      conjunction: 'and',
      conditions: [
        {
          field_name: '最后更新时间',
          operator: 'isGreater',
          value: ['ExactDate', todayStart + ''],
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

    let issues = await this.getIssues(filter);
    issues = issues.filter(
      (item) =>
        ['待处理', '处理中', '重新打开'].includes(
          item.fields['状态'] as string,
        ) && item.fields['话题信息'],
    );
    for (const issue of issues) {
      const threadInfo = JSON.parse(
        issue.fields['话题信息']?.[0].text as string,
      );
      const threadId = threadInfo.threadId;
      threadId &&
        (await this.messageHelper.forwardThread(userId, threadId, 'open_id'));
    }
  }
}
