import { Injectable } from '@nestjs/common';
import FeishuMessageHelper from '@src/common/feishu/helper/message-helper';

import { BaseService } from '@src/common/base/BaseService';
import { RedisService } from '@src/common/service/redis/redis.service';
// import { LoggerService } from '@src/common/service/logger/logger.service';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import Redis from 'ioredis';
import { UnresolvedCardData } from '@src/common/feishu/card/warning-card/error-unresolved-card';

@Injectable()
export abstract class AlertBaseService extends BaseService {
  protected readonly redis: Redis;
  // protected readonly logger: LoggerService;
  protected readonly messageHelper: FeishuMessageHelper;
  protected readonly redisService: RedisService;

  constructor(redisService) {
    super();
    this.redis = redisService.getClient();
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

  protected async updateIssueCardDataInCache(
    issueId: string,
    issueInfo: Partial<UnresolvedCardData>,
  ) {
    const key = RedisKeys.SENTRY_ALERT_COUNT_ISSUE.replace(
      '{issueId}',
      issueId,
    );
    await this.redis.hset(key, issueInfo);
    this.redis.expire(key, 60 * 60 * 24 * 7);
  }
}
