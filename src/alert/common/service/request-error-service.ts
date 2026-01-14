import { PrismaService } from '@src/common/service/prisma/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import FeishuApiAlertTable from '../table/api-alert-table';
import FeishuApiAlertIssueTable from '../table/api-alert-issue-table';
import { RedisService } from '@src/common/service/redis/redis.service';
import { RequestAlertEvent } from '../type/alert';
import { ErrorBaseService } from './error-base.service';
import RequestAlertFeishuAdapter from '../adapter/request-alert-feishu-adapter';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { Injectable } from '@nestjs/common';
import { MsgAlertService } from './msg-alert.service';
import { AlertContext } from './alert-event.context';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import FeishuUserHelper from '@src/common/feishu/helper/feishu-user-helper';
import { HttpService } from '@nestjs/axios';
import { BitTableFilter } from '@src/common/feishu/type/bitable';
import { IssueStatusEnum } from '@src/common/feishu/card/warning-card/interface';
export const ignoreCodeList = [
  '401',
  '10002',
  '408',
  '65013',
  '70102',
  '70101',
  'order_quantity_not_package',
  'no_more_than_thirty_thousand',
];

@Injectable()
export class RequestErrorService extends ErrorBaseService {
  protected ignoreCodeList = ignoreCodeList;

  constructor(
    protected prisma: PrismaService,
    protected readonly logger: LoggerService,
    protected readonly feishuApiTable: FeishuApiAlertTable,
    protected readonly feishuApiIssueTable: FeishuApiAlertIssueTable,
    protected readonly redisService: RedisService,
    protected readonly alertFeishuAdapter: RequestAlertFeishuAdapter,
    protected readonly msgAlertService: MsgAlertService,
    protected readonly alertContext: AlertContext,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly feishuUserHelper: FeishuUserHelper,
    protected readonly httpService: HttpService,
  ) {
    super(redisService);
  }

  isIgnoreThisError() {
    return (
      this.ignoreCodeList.includes(
        this.alertContext.event.requestData.code + '',
      ) || super.isIgnoreThisError()
    );
  }
  async errorHookHandler(errorEvent: RequestAlertEvent) {
    this.alertContext.run({ errorEvent }, async () => {
      return this.errorHandler();
    });
  }

  protected async writeToTable() {
    this.writeToBackEndIssueTable();

    const backEndFields = await this.alertFeishuAdapter.toApiAlertTableData();
    // 异步记录事件到多维表格
    const backEventRecord = await this.feishuApiTable.create(backEndFields);
    const { record_url } = await this.feishuApiTable.get(
      backEventRecord.record_id,
      {
        with_shared_url: true,
      },
    );

    return {
      ...backEventRecord,
      record_url,
    };
  }
  protected async writeToBackEndIssueTable(): Promise<void> {
    try {
      //查询issue
      const filter: BitTableFilter = {
        conjunction: 'and',
        conditions: [
          {
            field_name: 'IssueId',
            operator: 'is',
            value: [this.alertContext.event.issueId],
          },
        ],
      };
      const issueRes = await this.feishuApiIssueTable.search(
        { filter },
        {},
        false,
      );
      if (issueRes.total == 0) {
        const issue = await this.alertFeishuAdapter.toApiAlertIssueTableData();
        if (this.isIgnoreThisError()) {
          issue['状态'] = IssueStatusEnum.ignoreCount100;
        }
        await this.feishuApiIssueTable.create(issue);
      } else {
        const record = issueRes.items[0];
        const { record_id: recordId, fields } = record;
        await this.feishuApiIssueTable.update(recordId, {
          错误次数: (fields['错误次数'] as number) + 1,
          日错误次数: (fields['日错误次数'] as number) + 1,
          状态: this.getStatusThenError(fields['状态'] as IssueStatusEnum),
        });
      }
    } catch (err) {
      sendExceptionToFeishu(err);
    }
  }
  async updateTable(issue_id: string, recordNew: Record<string, any>) {
    const table = this.feishuApiIssueTable;
    const filter: BitTableFilter = {
      conjunction: 'and',
      conditions: [
        {
          field_name: 'IssueId',
          operator: 'is',
          value: [issue_id],
        },
      ],
    };
    const issueRes = await table.search({ filter }, {}, false);
    if (issueRes.total == 0) {
      sendExceptionToFeishu(new Error('修改卡片消息时未找到issue:' + issue_id));
    } else {
      const record = issueRes.items[0];
      const { record_id: recordId } = record;
      await table.update(recordId, recordNew);
    }
  }
  protected afterCreateIssueCard() {}
}
