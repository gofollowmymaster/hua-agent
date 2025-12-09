import { PrismaService } from '@src/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import FeishuMessageHelper from '@src/common/feishu/hepler/message-helper';
import FeishuApiAlertTable from '../table/api-alert-table';
import FeishuApiAlertIssueTable from '../table/api-alert-issue-table';
import FeishuFrontendAlertTable from '../table/frontend-alert-table';
import FeishuFrontendAlertIssueTable from '../table/frontend-alert-issue-table';
import FeishuBusinessLineTable from '@src/common/table/business-line-table';
import { RedisService } from '@src/common/service/redis/redis.service';
import FeishuUserHelper from '@src/common/feishu/hepler/feishu-user-helper';
import { HttpService } from '@nestjs/axios';
import { PageAlertEvent } from '../type/alert';
import PageAlertFeishuAdapter from '../adapter/page-alert-feishu-adapter';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { ErrorBaseService } from './error-base.service';
import { Injectable } from '@nestjs/common';
import { IssueStatusEnum } from '@src/common/feishu/card/error-unresolve-card';
import FeishuAilyHelper from '@src/common/feishu/hepler/feishu-aily-helper';
import { FeishuMsgType } from '@src/common/feishu/type/im';
import { useAilyAlertSkill } from '../utils';

@Injectable()
export class PageErrorService extends ErrorBaseService {
  constructor(
    protected prisma: PrismaService,
    protected readonly logger: LoggerService,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly feishuApiTable: FeishuApiAlertTable,
    protected readonly feishuApiIssueTable: FeishuApiAlertIssueTable,
    protected readonly feishuFrontendTable: FeishuFrontendAlertTable,
    protected readonly feishuFrontendIssueTable: FeishuFrontendAlertIssueTable,
    protected readonly feishuBusinessLineTable: FeishuBusinessLineTable,
    protected readonly redisService: RedisService,
    protected readonly alertFeishuAdapter: PageAlertFeishuAdapter,
    protected readonly feishuUserHelper: FeishuUserHelper,
    protected readonly httpService: HttpService,
    protected readonly feishuAilyHelper: FeishuAilyHelper,
  ) {
    super(redisService);
  }

  async errorHookHandler(errorEvent: PageAlertEvent) {
    await this.setErrorEvent(errorEvent);
    this.errorHandler();
  }

  protected async writeToTable(errorEvent: PageAlertEvent) {
    this.writeToFrontendIssueTable(errorEvent);
    // 异步记录事件到多维表格
    const frontEndFields = this.alertFeishuAdapter.toFrontendAlertTableData();

    const frontEventRecord =
      await this.feishuFrontendTable.create(frontEndFields);
    const { record_url } = await this.feishuFrontendTable.get(
      frontEventRecord.record_id,
      {
        with_shared_url: true,
      },
    );

    return {
      ...frontEventRecord,
      record_url,
    };
  }

  protected async writeToFrontendIssueTable(alertInfo: PageAlertEvent) {
    // try {
    const { total, items: records } =
      await this.feishuFrontendIssueTable.search(
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
    if (total == 0) {
      const issue = this.alertFeishuAdapter.toFrontendAlertIssueTableData();
      if (this.isIgnoreThisError()) {
        issue['状态'] = IssueStatusEnum.ignoreCount100;
      }
      console.log('[ issue ] >', issue);
      await this.feishuFrontendIssueTable.create(issue);
    } else {
      const { record_id: recordId, fields } = records[0];
      await this.feishuFrontendIssueTable.update(recordId, {
        错误次数: (fields['错误次数'] as number) + 1,
        日错误次数: (fields['日错误次数'] as number) + 1,
        状态: this.getStatusThenError(fields['状态'] as IssueStatusEnum),
      });
    }
    // } catch (err) {
    //   sendExceptionToFeishu(err);
    // }
  }

  async updateTable(issue_id: string, recordNew: Record<string, any>) {
    const table = this.feishuFrontendIssueTable;
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

  protected async afterCreateIssueCard() {
    //部分消息不需要AI辅助分析 比如：403
    if (
      this.errorEvent.environment.indexOf('prod') < 0 ||
      [
        'request.onerror Network Error',
        'Object captured as exception with keys: code, message, method, payload, resData',
      ].includes(this.errorEvent.message) ||
      process.env.NODE_ENV !== 'production'
    )
      return;
    const answer = await useAilyAlertSkill(
      this.errorEvent.message || this.errorEvent.title,
    );
    if (answer.length < 20) return;
    const message = '辅助分析：\n' + answer;
    const issueInfo = await this.checkIssueInCache(this.errorEvent.issueId);
    this.messageHelper.replyInThread(
      JSON.stringify({
        zh_cn: {
          content: [
            [
              {
                tag: 'md',
                text: message,
              },
            ],
          ],
        },
      }),
      issueInfo.messageId,
      FeishuMsgType.Post,
    );
  }
}
