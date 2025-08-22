import { PrismaService } from '@src/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import FeishuApiAlertTable from '../table/api-alert-table';
import FeishuApiAlertIssueTable from '../table/api-alert-issue-table';
import FeishuFrontendAlertTable from '../table/frontend-alert-table';
import FeishuFrontendAlertIssueTable from '../table/frontend-alert-issue-table';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import { RedisService } from '@src/common/service/redis/redis.service';
import FeishuUserHelper from '@src/common/feishu/hepler/feishu-user-helper';
import { HttpService } from '@nestjs/axios';
import { AlertEvent, RequestAlertEvent } from '../type/alert';
import { ErrorBaseService } from './error-base.service';
import RequestAlertFeishuAdapter from '../adapter/request-alert-feishu-adapter';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { Injectable } from '@nestjs/common';
import { IssueStatusEnum } from '@src/common/feishu/card/error-unresolve-card';
export const ignoreCodeList = ['401', '10002', '408'];

@Injectable()
export class RequestErrorService extends ErrorBaseService {
  protected ignoreCodeList = ignoreCodeList;

  constructor(
    protected prisma: PrismaService,
    protected readonly logger: LoggerService,
    protected readonly config: ConfigService,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly feishuApiTable: FeishuApiAlertTable,
    protected readonly feishuApiIssueTable: FeishuApiAlertIssueTable,
    protected readonly feishuFrontendTable: FeishuFrontendAlertTable,
    protected readonly feishuFrontendIssueTable: FeishuFrontendAlertIssueTable,
    protected readonly feishuBusinessLineTable: FeishuBusinessLineTable,
    protected readonly redisService: RedisService,
    protected readonly alertFeishuAdapter: RequestAlertFeishuAdapter,
    protected readonly feishuUserHelper: FeishuUserHelper,
    protected readonly httpService: HttpService,
  ) {
    super(redisService);
  }

  isIgnoreThisError() {
    return this.ignoreCodeList.includes(this.errorEvent.requestData.code + '');
  }
  async errorHookHandler(errorEvent: RequestAlertEvent) {
    await this.setErrorEvent(errorEvent);

    this.errorHandler();
  }

  protected async writeToTable(errorEvent: RequestAlertEvent) {
    this.writeToBackEndIssueTable(errorEvent);
    const backEndFields = this.alertFeishuAdapter.toApiAlertTableData();
    // 异步记录事件到多维表格
    const { record: backEventRecord } =
      await this.feishuApiTable.create(backEndFields);
    const {
      record: { record_url },
    } = await this.feishuApiTable.get(backEventRecord.record_id, {
      with_shared_url: true,
    });

    return {
      ...backEventRecord,
      recordUrl: record_url,
    };
  }
  protected async writeToBackEndIssueTable(
    alertInfo: AlertEvent,
  ): Promise<void> {
    try {
      //查询issue
      const issueRes = await this.feishuApiIssueTable.search(
        {
          conjunction: 'and',
          conditions: [
            {
              field_name: 'IssueId',
              operator: 'is',
              value: [alertInfo.issueId],
            },
          ],
        },
        {},
        false,
      );
      if (issueRes.total == 0) {
        const issue = this.alertFeishuAdapter.toApiAlertIssueTableData();
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
    const issueRes = await table.search(
      {
        conjunction: 'and',
        conditions: [
          {
            field_name: 'IssueId',
            operator: 'is',
            value: [issue_id],
          },
        ],
      },
      {},
      false,
    );
    if (issueRes.total == 0) {
      sendExceptionToFeishu(new Error('修改卡片消息时未找到issue:' + issue_id));
    } else {
      const record = issueRes.items[0];
      const { record_id: recordId } = record;
      await table.update(recordId, recordNew);
    }
  }
}
