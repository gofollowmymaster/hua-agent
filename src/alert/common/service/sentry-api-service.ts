import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { IssueStatus } from '@src/common/feishu/card/error-unresolve-card';
import { firstValueFrom } from 'rxjs';
import { sendExceptionToFeishu } from '@src/common/feishu/utils';
import {
  // IssueStatusDetails,
  IssueStatusDetailsType,
  SentryIssue,
  SentryStatus,
} from '../type/sentry';

type UpdateIssueParams = {
  status?: IssueStatus;

  assignedTo?: string;
  hasSeen?: boolean;
  isBookmarked?: boolean;
};
type UpdateIssueOriginParams = {
  status?: SentryStatus;
  statusDetails?: IssueStatusDetailsType;
  assignedTo?: string;
  hasSeen?: boolean;
  isBookmarked?: boolean;
};
@Injectable()
export class SentryApiService {
  prefix =
    'https://cloud.elnkpro.com:9000/api/0/organizations/aplus-frontend-team';
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}
  dataAdapter(params: UpdateIssueParams): UpdateIssueOriginParams {
    let status,
      statusDetails = {} as IssueStatusDetailsType;
    if (params.status == 'ignoreCount100') {
      status = 'ignored';
      statusDetails = {
        ignoreCount: 50,
      };
    } else if (params.status == 'ignoreCount1000') {
      status = 'ignored';
      statusDetails = {
        ignoreCount: 500,
      };
    } else {
      status = params.status;
    }
    return {
      ...params,
      status,
      statusDetails,
    };
  }
  async updateIssue(body: UpdateIssueParams, issue_id: string) {
    try {
      const reqBody = this.dataAdapter(body);

      const { data } = await firstValueFrom(
        this.httpService.put(`${this.prefix}/issues/${issue_id}/`, reqBody, {
          headers: {
            Authorization: `Bearer ${this.config.get('sentryIntegrationToken')}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      return data;
    } catch (err) {
      sendExceptionToFeishu(err, '修改Sentry issue失败,IssueId:' + issue_id);
    }
  }
  async getIssueDetail(issueId: string): Promise<SentryIssue> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.prefix}/issues/${issueId}/`, {
          headers: {
            Authorization: `Bearer ${this.config.get('sentryIntegrationToken')}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      return data;
    } catch (err) {
      sendExceptionToFeishu(
        err,
        '获取Sentry issue 详情失败,IssueId:' + issueId,
      );
    }
  }
  async isIssueIgnored(issueId: string) {
    const { status } = await this.getIssueDetail(issueId);
    return status === 'ignored';
  }
}
