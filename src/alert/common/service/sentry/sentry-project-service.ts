import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SentryProject } from '../../type/sentry-project';
import { RedisService } from '@src/common/service/redis/redis.service';
import Redis from 'ioredis';
import { NodeConfigService } from '@src/config/node-config.service';
import HttpApiHelper from '@src/common/base/http-api-service';
import { RedisKeys } from '@src/common/const/redis-key.enum';

@Injectable()
export class SentryProjectService extends HttpApiHelper {
  prefix = 'https://cloud.elnkpro.com:9000/api/0/projects/aplus-frontend-team';
  protected readonly redis: Redis;
  protected readonly ttl: number = 60 * 60 * 24;
  constructor(
    private readonly httpService: HttpService,
    protected readonly redisService: RedisService,
  ) {
    super(redisService, RedisKeys.SENTRY_API_CACHE);
    this.redis = redisService.getClient();
  }

  async getProjectDetail(projectId: string | number): Promise<SentryProject> {
    return this.readWrapper(
      async () => {
        const { data } = await firstValueFrom(
          this.httpService.get(`${this.prefix}/${projectId}/`, {
            headers: {
              Authorization: `Bearer ${NodeConfigService.get('sentryIntegrationToken')}`,
              'Content-Type': 'application/json',
            },
          }),
        );
        return data;
      },
      true,
      'getProjectDetail',
    );
  }
  async getProjectNameById(projectId: string | number): Promise<string> {
    const { name = '未知项目' } = await this.getProjectDetail(projectId);
    return name;
  }
}
