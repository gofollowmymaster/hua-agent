import { RedisService } from '@src/common/service/redis/redis.service';
import { ErrorEndpoint } from '../type/alert';
import { ErrorBaseService } from '@src/common/base/error-base.service';
import { Injectable } from '@nestjs/common';
import { RequestErrorService } from './request-error-service';
import { PageErrorService } from './page-error-service';
import { AlertBaseService } from '@src/common/base/alert-base.service';

@Injectable()
export class CommonErrorService extends AlertBaseService {
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
}
