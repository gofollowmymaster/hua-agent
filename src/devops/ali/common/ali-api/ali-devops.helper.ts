import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import HttpApiHelper from '@src/common/base/http-api-service';
import Redis from 'ioredis';
import { RedisService } from '@src/common/service/redis/redis.service';
import { RedisKeys } from '@src/common/const/redis-key.enum';
import { NodeConfigService } from '@src/config/node-config.service';
import {
  AppInfoType,
  AppReleaseWorkflow,
  AppWorkflowPublishType,
  executeAppReleaseWorkflowBody,
  executeAppReleaseWorkflowQuery,
  executeAppReleaseWorkflowType,
  PipelineDetail,
} from './interface';
// import { AppWorkflowType } from '../../types/devops';
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
  async getRequest(url: string, options?: any) {
    this.setAliyunToken();

    const { data } = await firstValueFrom(
      this.httpService.get(this.prefix + this.organizationId + url, {
        headers: this.headers,
        ...options,
      }),
    );
    return data;
  }
  async postRequest(url: string, body: Record<string, any>, options?: any) {
    this.setAliyunToken();
    const { data } = await firstValueFrom(
      this.httpService.post(this.prefix + this.organizationId + url, body, {
        headers: this.headers,
        ...options,
      }),
    );
    return data;
  }

  async queryAllApp(): Promise<AppInfoType> {
    const uri = `/apps:search?pagination=keyset&orderBy=id&perPage=100&sort=asc`;

    return this.readWrapper(
      async () => {
        const res = await this.getRequest(uri);
        return res;
      },
      true,
      uri,
    );
  }

  /** 分页查找应用源详情 */
  async queryAppSource(appName: string) {
    const uri = `/apps/${appName}/sources?pagination=keyset&orderBy=id&perPage=100&sort=asc`;
    return this.readWrapper(
      async () => {
        return await this.getRequest(uri);
      },
      true,
      uri,
    );
  }
  async queryAppRelease(appName) {
    const uri = `/apps/${appName}`;
    return this.readWrapper(
      async () => {
        return await this.getRequest(uri);
      },
      true,
      uri,
    );
  }
  /** 查找应用下所有的研发流程 */
  async queryAppReleaseWorkflow(appOption: {
    appName: string;
    workflowName: string;
  }): Promise<AppWorkflowPublishType> {
    const uri = `/apps/${appOption.appName}/releaseWorkflows`;
    const info: AppReleaseWorkflow = await this.readWrapper(
      async () => {
        return await this.getRequest(uri);
      },
      true,
      uri,
    );
    //只取第一个
    return this.handleWorkflowData(info[0], appOption);
  }
  handleWorkflowData = (
    appConfig: any,
    appOption: {
      appName: string;
      workflowName: string;
    },
  ): AppWorkflowPublishType => {
    const releaseStages = appConfig.releaseStages;
    console.log(
      '[ releaseStages ] >',
      releaseStages,
      releaseStages.name,
      appOption.workflowName,
    );
    const handleWorkflowSource = releaseStages.find(
      (workflowStage) => workflowStage.name === appOption.workflowName,
    );
    console.log('[ handleWorkflowSource ] >', handleWorkflowSource);
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
      url: `https://devops.aliyun.com/appstack/app/${appOption.appName}/workflow/${appConfig.sn}/stage/${handleWorkflowSource.sn}/builds/`,
    };
  };
  async executeAppReleaseWorkflow(
    pathParams: executeAppReleaseWorkflowQuery,
    params: executeAppReleaseWorkflowBody,
  ): Promise<executeAppReleaseWorkflowType> {
    const { appName, releaseWorkflowSn, releaseStageSn } = pathParams;

    return this.requestWrapper(async () => {
      const uri = `/apps/${appName}/releaseWorkflows/${releaseWorkflowSn}/releaseStages/${releaseStageSn}:execute`;

      return this.postRequest(uri, { params });
    }, 'executeAppReleaseWorkflow');
  }

  async cancelExecuteAppReleaseWorkflow(
    pathParams,
  ): Promise<executeAppReleaseWorkflowType> {
    const { appName, releaseWorkflowSn, releaseStageSn, executionNumber } =
      pathParams;

    return this.requestWrapper(async () => {
      const uri = `/apps/${appName}/releaseWorkflows/${releaseWorkflowSn}/releaseStages/${releaseStageSn}/executions/${executionNumber}:cancel`;

      return this.postRequest(uri, {});
    }, 'cancelExecuteAppReleaseWorkflow');
  }

  async passExecuteAppReleaseWorkflow(
    pathParams,
  ): Promise<{ success: boolean }> {
    const {
      appName,
      releaseWorkflowSn,
      releaseStageSn,
      executionNumber,
      jobId,
    } = pathParams;

    const uri = `/apps/${appName}/releaseWorkflows/${releaseWorkflowSn}/releaseStages/${releaseStageSn}/executions/${executionNumber}:passPipelineValidate?jobId=${jobId}`;
    return this.postRequest(uri, {});
  }

  async refuseExecuteAppReleaseWorkflow(
    pathParams,
  ): Promise<{ success: boolean }> {
    const {
      appName,
      releaseWorkflowSn,
      releaseStageSn,
      executionNumber,
      jobId,
    } = pathParams;

    const uri = `/apps/${appName}/releaseWorkflows/${releaseWorkflowSn}/releaseStages/${releaseStageSn}/executions/${executionNumber}:refusePipelineValidate?jobId=${jobId}`;
    return this.postRequest(uri, {});
  }
  //
  async getPipelineDetail(pathParams): Promise<PipelineDetail> {
    const { appName, releaseWorkflowSn, releaseStageSn, pipelineRunId } =
      pathParams;

    return this.requestWrapper(async () => {
      const uri = `/apps/${appName}/releaseWorkflows/${releaseWorkflowSn}/releaseStages/${releaseStageSn}/executions/${pipelineRunId}:getPipelineRun`;
      return await this.getRequest(uri);
    }, 'getPipelineDetail');
  }

  async listAppReleaseStageRuns(pathParams) {
    return this.requestWrapper(async () => {
      const { appName, releaseWorkflowSn, releaseStageSn, nextToken } =
        pathParams;
      const uri = `/apps/${appName}/releaseWorkflows/${releaseWorkflowSn}/releaseStages/${releaseStageSn}/executions?nextToken=${nextToken}&pagination=keyset&orderBy=id&perPage=100&sort=desc`;
      return await this.getRequest(uri);
    }, 'ListAppReleaseStageRuns');
  }

  async queryAllAppTemplate() {
    return this.readWrapper(
      async () => {
        const uri = ` /appTemplates:search?pagination=keyset&orderBy=id&perPage=100&sort=asc`;
        return await this.getRequest(uri);
      },
      true,
      'queryAllAppTemplate',
    );
  }

  //
}
