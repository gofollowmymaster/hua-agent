import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import HttpApiHelper from '@src/common/base/http-api-service';
import Redis from 'ioredis';
import { RedisService } from '@src/common/service/redis/redis.service';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { NodeConfigService } from '@src/common/service/node-config-service/node-config.service';
import {
  AppInfoType,
  AppReleaseWorkflow,
  AppWorkflowPublishType,
  PipelineDetail,
  PipelineStage,
} from './interface';
import { AppWorkflowType } from '../../types/devops';
import { AliDevopsContext } from '../service/ali-devops.context';

@Injectable()
export class DevopsApiService extends HttpApiHelper {
  private readonly prefix =
    'https://openapi-rdc.aliyuncs.com/oapi/v1/appstack/organizations/';
  private readonly organizationId: string;
  protected readonly redis: Redis;
  protected readonly ttl: number = 60 * 60 * 12;
  protected readonly useCache: boolean = true;

  protected readonly headers = {
    'Content-Type': 'application/json',
    'x-yunxiao-token': ``,
  };
  constructor(
    private readonly httpService: HttpService,
    protected readonly redisService: RedisService,
    protected readonly devopsContext: AliDevopsContext,
  ) {
    super(redisService, RedisKeys.ALI_DEVOPS_API_CACHE);
    this.redis = redisService.getClient();
    this.organizationId = NodeConfigService.getOrThrow('AliyunOrganizationId');
  }
  setAliyunToken(token?: string) {
    token = token ?? this.devopsContext.token;
    this.headers['x-yunxiao-token'] = token;
  }

  async quaryAllApp(): Promise<AppInfoType> {
    const uri = `${this.organizationId}/apps:search?pagination=keyset&orderBy=id&perPage=100&sort=asc`;

    return this.readWrapper(
      async () => {
        this.setAliyunToken();

        const { data } = await firstValueFrom(
          this.httpService.get(this.prefix + uri, {
            headers: this.headers,
          }),
        );
        return data;
      },
      true,
      uri,
    );
  }

  /** 分页查找应用源详情 */
  async quaryAppSource(appName: string) {
    const uri = `${this.organizationId}/apps/${appName}/sources?pagination=keyset&orderBy=id&perPage=100&sort=asc`;
    return this.readWrapper(
      async () => {
        this.setAliyunToken();

        const { data } = await firstValueFrom(
          this.httpService.get(this.prefix + uri, {
            headers: this.headers,
          }),
        );
        return data;
      },
      true,
      uri,
    );
  }
  async quaryAppRelease(appName) {
    const uri = `${this.organizationId}/apps/${appName}`;
    return this.readWrapper(
      async () => {
        this.setAliyunToken();

        const { data } = await firstValueFrom(
          this.httpService.get(this.prefix + uri, {
            headers: this.headers,
          }),
        );
        return data;
      },
      true,
      uri,
    );
  }
  /** 查找应用下所有的研发流程 */
  async quaryAppReleaseWorkflow(
    appOption: AppWorkflowType,
  ): Promise<AppWorkflowPublishType> {
    const uri = `${this.organizationId}/apps/${appOption.appName}/releaseWorkflows`;
    const info: AppReleaseWorkflow = await this.readWrapper(
      async () => {
        this.setAliyunToken();

        const { data } = await firstValueFrom(
          this.httpService.get(this.prefix + uri, {
            headers: this.headers,
          }),
        );

        return data;
      },
      true,
      uri,
    );
    //只去第一个
    return this.handleWorkflowData(info[0], appOption);
  }
  handleWorkflowData = (
    appConfig: any,
    appOption: AppWorkflowType,
  ): AppWorkflowPublishType => {
    const releaseStages = appConfig.releaseStages;
    const handleWorkflowSource = releaseStages.find(
      (workflowStage) => workflowStage.name === appOption.workflowName,
    );
    const pipelineConfig =
      handleWorkflowSource.pipeline.pipeline.pipelineConfigVo ?? {};
    const settings = JSON.parse(pipelineConfig.settings ?? '{}');
    const globalParams = (settings?.globalParams ?? []).map((item: any) => {
      if (item.metaData) {
        item.metaData = JSON.parse(item.metaData);
      }
      return item;
    });

    const sources = JSON.parse(pipelineConfig.sources ?? '[]')[0];
    const runParams = globalParams.reduce(
      (prev, item) => {
        if (item.runningConfig) {
          prev[item.key] = item.value;
        }
        return prev;
      },
      {} as Record<string, string>,
    );
    return {
      /** 应用名称 */
      appName: appOption.appName,
      /** 研发流程sn */
      releaseWorkflowSn: appConfig.sn,
      /** 研发阶段名称 */
      workflowName: handleWorkflowSource.name,
      /** 研发阶段sn */
      releaseStageSn: handleWorkflowSource.sn,
      /** 发起请求需要的params参数 */
      runParams,
      /** 源码库id 在请求参数中作为设置分支名称 */
      sourcesID: sources.sign,
      url: `https://devops.aliyun.com/appstack/app/${appOption.appName}/workflow/${appConfig.sn}/stage/${handleWorkflowSource.sn}/current`,
    };
  };
  async executeAppReleaseWorkflow(pathParams, params) {
    const { appName, releaseWorkflowSn, releaseStageSn } = pathParams;

    return this.requestWrapper(async () => {
      this.setAliyunToken();

      const { data } = await firstValueFrom(
        this.httpService.post(
          `${this.prefix}${this.organizationId}/apps/${appName}/releaseWorkflows/${releaseWorkflowSn}/releaseStages/${releaseStageSn}:execute`,

          {
            params,
          },
          {
            headers: this.headers,
          },
        ),
      );
      return data;
    }, 'executeAppReleaseWorkflow');
  }
  async getPipelineDetail(pathParams): Promise<PipelineDetail> {
    const { appName, releaseWorkflowSn, releaseStageSn, pipelineRunId } =
      pathParams;

    return this.requestWrapper(async () => {
      this.setAliyunToken();

      const { data } = await firstValueFrom(
        this.httpService.get(
          `${this.prefix}${this.organizationId}/apps/${appName}/releaseWorkflows/${releaseWorkflowSn}/releaseStages/${releaseStageSn}/executions/${pipelineRunId}:getPipelineRun`,
          {
            headers: this.headers,
          },
        ),
      );
      return data;
    }, 'getPipelineDetail');
  }

  async quaryAllAppTemplate() {
    return this.readWrapper(
      async () => {
        this.setAliyunToken();

        const { data } = await firstValueFrom(
          this.httpService.get(
            `${this.prefix}${this.organizationId}/appTemplates:search?pagination=keyset&orderBy=id&perPage=100&sort=asc`,

            {
              headers: this.headers,
            },
          ),
        );
        return data;
      },
      true,
      'quaryAllAppTemplate',
    );
  }

  //
}
