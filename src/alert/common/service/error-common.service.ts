import { RedisService } from '@src/common/service/redis/redis.service';
import { AlertEvent, ErrorEndpoint } from '../type/alert';
import { ErrorBaseService } from './error-base.service';
import { Injectable } from '@nestjs/common';
import { UnresolvedCardData } from '@src/common/feishu/card/error-unresolve-card';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { RequestErrorService } from './request-error-service';
import { PageErrorService } from './page-error-service';

@Injectable()
export class CommonErrorService extends ErrorBaseService {
  protected readonly pageErrorService: PageErrorService;
  protected readonly requestErrorService: RequestErrorService;
  constructor(protected readonly redisService: RedisService) {
    super(redisService);
  }
  async getServiceByIssueId(IssueId = ''): Promise<ErrorBaseService> {
    const issueInfo = await this.checkIssueInCache(IssueId);
    const errorEndpoint = issueInfo.errorEndpoint as ErrorEndpoint;

    return this.getServiceByEndPort(errorEndpoint);
  }
  async checkIssueInCache(issueId: string) {
    const issueInfo = (await this.redis.hgetall(
      RedisKeys.SENTRY_ALERT_COUNT_ISSUE.replace('{issueId}', issueId),
    )) as UnresolvedCardData;

    if (!issueInfo.issueId) {
      //跨天问题
      throw new Error(`Issue:${issueId}已失效`);
    }
    return issueInfo;
  }
  async getServiceByEndPort(
    errorEndpoint: ErrorEndpoint,
  ): Promise<ErrorBaseService> {
    switch (errorEndpoint) {
      case ErrorEndpoint.Page:
        return this.pageErrorService;
      case ErrorEndpoint.Server:
        return this.requestErrorService;
      default:
        throw new Error('errorEndpoint is not defined');
    }
  }

  protected async writeToTable(errorEvent: AlertEvent): Promise<void> {
    console.log('[ errorEvent ] >', errorEvent);
  }

  async updateTable(issue_id: string, recordNew: Record<string, any>) {
    console.log('[ issue_id ] >', issue_id, recordNew);
  }

  async errorHookHandler(errorEvent: AlertEvent) {
    console.log('[ errorEvent ] >', errorEvent);
  }
}
