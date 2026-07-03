export type Payload = {
  /** 环境名称 */
  APP_ENV_NAME: string;
  /** 标签头 */
  e_tag_header: string;
  /** 流水线运行备注 */
  FLOW_INST_RUNNING_COMMENT?: string;
  /** 其他参数 分支名称等 */
  [key: string]: string | undefined;
};

export type PipelineGlobalParams = {
  description: string;
  encrypted: boolean;
  key: string;
  masked: boolean;
  runningConfig: boolean;
  value: string;
  metaData: Record<string, any>;
};
export type PipelineSetting = {
  concurrencyConfig: {
    concurrency: number;
    enable: boolean;
    jobConcurrency: number;
    model: string;
  };
  globalParams: PipelineGlobalParams[];
};
export type PipelineConfigVo = {
  settings: string;
};
export type AppReleasePipeline = {
  pipelineConfigVo: PipelineConfigVo;
  creator: string;
  gmtModified: number;
  timezone: string;
  groupId: number;
  modifier: string;
  pipelineSystemType: 'appDeployment';
  siteFrom: 'teambition';
  originPipelineId: number;
  readOnly: 'N' | 'Y';
  gmtCreate: number;
  lastConfigId: number;
  locale: 'zh_CN';
  uuid: string;
  lastInstId: number;
  groupName: string;
  isDeleted: 'N' | 'Y';
  regionId: number;
  name: string;
  id: number;
  clonePipeline: boolean;
  status: 'ONLINE';
};
export type ReleaseStages = {
  appName: string;
  name: string;
  order: string;

  sn: string;
  releaseWorkflowSn: string;
  note: string;
  labels: Record<string, string>[];
  pipeline: {
    pipeline: AppReleasePipeline;
    engineSn: string;
  };
};
export type AppReleaseWorkflow = {
  appName: string;
  name: string;
  note: string;
  order: string;

  sn: `sn-${string}`;
  type: 'CR' | 'APP_RELEASE';
  releaseStages: ReleaseStages[];
};
export type PipelineStageType =
  | 'SUCCESS'
  | 'FAIL'
  | 'RUNNING'
  | 'WAITING'
  | 'INIT'
  | 'CANCELED';
export type AppWorkflowPublishType = {
  /** 应用名称 */
  appName: string;
  /** 研发流程sn */
  releaseWorkflowSn: string;
  /** 研发阶段名称 */
  workflowName: string;
  /** 研发阶段sn */
  releaseStageSn: string;
  /** 发起请求需要的params参数 */
  runParams: Record<string, string>;
  /** 源码库id 在请求参数中作为设置分支名称 */
  sourcesID: string;
  url: string;
  status?: PipelineStageType;
  executionNumber?: string;
  jobId?: string;
};

export type executeAppReleaseWorkflowResponse = {
  object: string;
  pipelineRunId: string;
  pipelineId: string;
};

export type AppInfoItemType = {
  creatorAccountId?: string;
  creatorId: string;
  name: string;
  gmtCreate: string;
  description: string;
  appTemplateName: string;
  appTemplateDisplayName: string;
  tags?: string[];
};

export type AppInfoType = {
  nextToken: string;
  data: AppInfoItemType[];
};

export type PipelineStageJob = {
  id: number;
  name: string;
  status: PipelineStageType;
  startTime?: number;
  endTime?: number;
  params: any;
  actions: Record<string, any>[];
  jobSign: string;
  result: string;
};
export type PipelineStageInfo = {
  startTime: number;
  endTime?: number;
  name: string;
  status: PipelineStageType;
  jobs: PipelineStageJob[];
};
export type PipelineStage = {
  index: string;
  name: string;
  stageInfo: PipelineStageInfo;
};

export type PipelineDetail = {
  pipelineRun: {
    stages: PipelineStage[];
  };
};

export type executeAppReleaseWorkflowType = {
  //流水线运行 id，也即流水线的运行次数。
  object: number;
  //	流水线 ID。
  pipelineId: number;
  //流水线运行 id，也即流水线的运行编号。
  pipelineRunId: number;
  time?: number;
};

export type executeAppReleaseWorkflowQuery = {
  appName: string;
  releaseWorkflowSn: string;
  releaseStageSn: string;
};
export type executeAppReleaseWorkflowBody = {
  [key: string]: any;
};
