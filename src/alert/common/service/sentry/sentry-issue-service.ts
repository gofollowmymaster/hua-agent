import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { IssueStatus } from '@src/common/feishu/card/error-unresolve-card';
import { firstValueFrom } from 'rxjs';
import {
  IssueStatusDetailsType,
  SentryIssue,
  SentryStatus,
} from '../../type/sentry-issue';

import { NodeConfigService } from '@src/common/service/node-config-service/node-config.service';
import HttpApiHelper from '@src/common/base/http-api-service';

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
export class SentryIssueService extends HttpApiHelper {
  prefix =
    'https://cloud.elnkpro.com:9000/api/0/organizations/aplus-frontend-team';
  constructor(private readonly httpService: HttpService) {
    super();
  }
  dataAdapter(params: UpdateIssueParams): UpdateIssueOriginParams {
    let status,
      statusDetails = {} as IssueStatusDetailsType;
    if (params.status == 'ignoreCount100') {
      status = 'ignored';
      statusDetails = {
        ignoreCount: 50,
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
    return this.requestWrapper(async () => {
      const reqBody = this.dataAdapter(body);

      const { data } = await firstValueFrom(
        this.httpService.put(`${this.prefix}/issues/${issue_id}/`, reqBody, {
          headers: {
            Authorization: `Bearer ${NodeConfigService.get('sentryIntegrationToken')}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      return data;
    }, 'updateIssue');
  }
  async getIssueDetail(issueId: string): Promise<SentryIssue> {
    return this.requestWrapper(async () => {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.prefix}/issues/${issueId}/`, {
          headers: {
            Authorization: `Bearer ${NodeConfigService.get('sentryIntegrationToken')}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      return data;
    }, 'getIssueDetail');
  }

  async isIssueIgnored(issueId: string) {
    const { status = 'activited' } = (await this.getIssueDetail(issueId)) || {};
    return status === 'ignored';
  }
}
