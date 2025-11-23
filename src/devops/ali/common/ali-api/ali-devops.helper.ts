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
import { NodeConfigService } from '@src/common/service/node-config-service/node-config.service';

@Injectable()
export class DevopsApiService extends HttpApiHelper {
  private readonly prefix =
    'https://openapi-rdc.aliyuncs.com/oapi/v1/appstack/organizations/';
  private readonly organizationId: string;
  protected readonly redis: Redis;
  protected readonly ttl: number = 60 * 60 * 24;
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
    this.organizationId = NodeConfigService.get('AliyunOrganizationId');
  }

  async quaryAllApp() {
    return this.requestWrapper(async () => {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${this.prefix}/${this.organizationId}/apps:search?pagination=keyset&orderBy=id&perPage=100&sort=asc`,
          {
            headers: this.headers,
          },
        ),
      );
      return data;
    }, 'quaryAllApp');
  }

  /** 分页查找应用源详情 */
  async quaryAppSource(appName: string) {
    return this.requestWrapper(async () => {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${this.prefix}/${this.organizationId}/apps/${appName}/sources?pagination=keyset&orderBy=id&perPage=100&sort=asc`,
          {
            headers: this.headers,
          },
        ),
      );
      return data;
    }, 'quaryAppSource');
  }
  async quaryAppRelease(appName) {
    return this.requestWrapper(async () => {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${this.prefix}/${this.organizationId}/apps/${appName}`,
          {
            headers: this.headers,
          },
        ),
      );
      return data;
    }, 'quaryAppRelease');
  }
  async quaryAppReleaseWorkflow(appName: string) {
    return this.requestWrapper(async () => {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${this.prefix}/${this.organizationId}/apps/${appName}/releaseWorkflows`,
          {
            headers: this.headers,
          },
        ),
      );
      return data;
    }, 'quaryAppReleaseWorkflow');
  }
  async executeAppReleaseWorkflow(pathParams, body) {
    const { appName, releaseWorkflowSn, releaseStageSn } = pathParams;
    return this.requestWrapper(async () => {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${this.prefix}/${this.organizationId}/apps/${appName}/releaseWorkflows/${releaseWorkflowSn}/releaseStages/${releaseStageSn}:execute`,

          {
            params: body,
          },
          {
            headers: this.headers,
          },
        ),
      );
      return data;
    }, 'executeAppReleaseWorkflow');
  }
  async quaryAllAppTemplate() {
    return this.requestWrapper(async () => {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${this.prefix}/${this.organizationId}/appTemplates:search?pagination=keyset&orderBy=id&perPage=100&sort=asc`,

          {
            headers: this.headers,
          },
        ),
      );
      return data;
    }, 'quaryAllAppTemplate');
  }

  //
}
