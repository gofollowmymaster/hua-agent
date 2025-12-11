import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// import {} from //   IssueStatusDetailsType,
// //   SentryIssue,
// //   SentryStatus,
// '../../types/devops';

// import { NodeConfigService } from '@src/common/service/node-config-service/node-config.service';
import HttpApiHelper from '@src/common/base/http-api-service';
import Redis from 'ioredis';
import { RedisService } from '@src/common/service/redis/redis.service';
import { RedisKeys } from '@src/common/const/redis-key.enum';

@Injectable()
export class AliCodeUpApiService extends HttpApiHelper {
  private readonly prefix =
    'https://openapi-rdc.aliyuncs.com/oapi/v1/appstack/organizations/';

  protected readonly redis: Redis;
  protected readonly ttl: number = 60 * 60 * 24;
  protected readonly useCache: boolean = true;
  protected readonly headers = {
    'Content-Type': 'application/json',
    'x-yunxiao-token': `${process.env.WORkFLOW_TOKEN}`,
  };
  constructor(
    private readonly httpService: HttpService,
    protected readonly redisService: RedisService,
  ) {
    super(redisService, RedisKeys.ALI_DEVOPS_API_CACHE);
    this.redis = redisService.getClient();
  }

  async queryAllCodeupRepositories(organizationId: string) {
    return this.requestWrapper(async () => {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${this.prefix}/${organizationId}/${organizationId}/repositories?pagination=keyset&orderBy=id&perPage=100&sort=asc&nextToken=token`,
          {
            headers: this.headers,
          },
        ),
      );
      return data;
    }, 'queryAllApp');
  }
  //
}
