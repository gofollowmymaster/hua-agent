import { PrismaService } from '@src/common/service/prisma/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import FeishuFrontendAlertTable from '../table/frontend-alert-table';
import FeishuFrontendAlertIssueTable from '../table/frontend-alert-issue-table';
import { RedisService } from '@src/common/service/redis/redis.service';
import { PageAlertEvent } from '../type/alert';
import PageAlertFeishuAdapter from '../adapter/page-alert-feishu-adapter';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import { ErrorBaseService } from './error-base.service';
import { Injectable } from '@nestjs/common';
import { IssueStatusEnum } from '@src/common/feishu/card/error-unresolved-card';
import { FeishuMsgType } from '@src/common/feishu/type/im';
import { useAilyAlertSkill } from '../utils';
import { MsgAlertService } from './msg-alert.service';
import { AlertContext } from './alert-event.context';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';
import FeishuUserHelper from '@src/common/feishu/helper/feishu-user-helper';
import { HttpService } from '@nestjs/axios';
import { BitTableFilter } from '@src/common/feishu/type/bitable';

@Injectable()
export class PageErrorService extends ErrorBaseService {
  constructor(
    protected prisma: PrismaService,
    protected readonly logger: LoggerService,
    protected readonly feishuFrontendTable: FeishuFrontendAlertTable,
    protected readonly feishuFrontendIssueTable: FeishuFrontendAlertIssueTable,
    protected readonly redisService: RedisService,
    protected readonly alertFeishuAdapter: PageAlertFeishuAdapter,
    protected readonly msgAlertService: MsgAlertService,
    protected readonly alertContext: AlertContext,
    protected readonly messageHelper: FeishuMessageHelper,
    protected readonly feishuUserHelper: FeishuUserHelper,
    protected readonly httpService: HttpService,
  ) {
    super(redisService);
  }

  async errorHookHandler(errorEvent: PageAlertEvent) {
    this.alertContext.run({ errorEvent }, async () => {
      return this.errorHandler();
    });
  }

  protected async writeToTable() {
    this.writeToFrontendIssueTable();
    // 异步记录事件到多维表格
    const frontEndFields =
      await this.alertFeishuAdapter.toFrontendAlertTableData();

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

  protected async writeToFrontendIssueTable() {
    // try {
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
    const { total, items: records } =
      await this.feishuFrontendIssueTable.search({ filter }, {}, false);
    if (total == 0) {
      const issue =
        await this.alertFeishuAdapter.toFrontendAlertIssueTableData();
      if (this.isIgnoreThisError()) {
        issue['状态'] = IssueStatusEnum.ignoreCount100;
      }
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

  protected async afterCreateIssueCard() {
    const errorEvent = this.alertContext.event;
    //部分消息不需要AI辅助分析 比如：403
    if (
      errorEvent.environment.indexOf('prod') < 0 ||
      [
        'request.onerror Network Error',
        'Object captured as exception with keys: code, message, method, payload, resData',
      ].includes(errorEvent.message) ||
      process.env.NODE_ENV !== 'production'
    )
      return;
    const answer = await useAilyAlertSkill(
      errorEvent.message || errorEvent.title,
    );
    if (answer.length < 20) return;
    const message = '辅助分析：\n' + answer;
    const issueInfo = await this.checkIssueInCache(errorEvent.issueId);
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
