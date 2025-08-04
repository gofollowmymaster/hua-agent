import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { IssueStatus } from '@src/common/feishu/card/error-unresolve-card';
import { firstValueFrom } from 'rxjs';

type IssueOriginStatus =
  | 'resolved'
  | 'resolvedInNextRelease'
  | 'unresolved'
  | 'ignored'
  | 'unresolved';
type IssueStatusDetails =
  | 'inRelease'
  | 'inNextRelease'
  | 'inCommit'
  | 'ignoreDuration'
  | 'ignoreCount'
  | 'ignoreWindow'
  | 'ignoreUserCount'
  | 'ignoreUserWindow';
type IssueStatusDetailsType = {
  [key in IssueStatusDetails]?: number;
};
type UpdateIssueParams = {
  status?: IssueStatus;

  assignedTo?: string;
  hasSeen?: boolean;
  isBookmarked?: boolean;
};
type UpdateIssueOriginParams = {
  status?: IssueOriginStatus;
  statusDetails?: IssueStatusDetailsType;
  assignedTo?: string;
  hasSeen?: boolean;
  isBookmarked?: boolean;
};
@Injectable()
export class SentryApiService {
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
        ignoreCount: 100,
      };
    } else if (params.status == 'ignoreCount1000') {
      status = 'ignored';
      statusDetails = {
        ignoreCount: 1000,
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
    const reqBody = this.dataAdapter(body);
    const { data } = await firstValueFrom(
      this.httpService.put(
        `https://cloud.elnkpro.com:9000/api/0/organizations/aplus-frontend-team/issues/${issue_id}/`,
        reqBody,
        {
          headers: {
            Authorization: `Bearer ${this.config.get('sentryIntegrationToken')}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    console.log('[ updateIssue-res ] >', data);
    return data;
  }
}
