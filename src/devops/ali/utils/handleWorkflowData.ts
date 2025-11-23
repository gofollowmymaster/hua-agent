/** 获取研发阶段列表 */
const getAppReleaseStage = (res: any, appName: string) => {
  const appConfig = res.find((item: any) => item.appName === appName);
  if (!appConfig) {
    process.exit(1);
  }
  return appConfig;
};
export const handleWorkflowData = (res: any, appName: string) => {
  const appConfig = getAppReleaseStage(res, appName);
  const workflowSource = appConfig.releaseStages;

  const handleWorkflowSource = workflowSource.map((item: any) => {
    const pipelineConfig = item.pipeline.pipeline.pipelineConfigVo ?? {};
    const settings = JSON.parse(pipelineConfig.settings ?? '{}');
    const globalParams = (settings?.globalParams ?? []).map((item: any) => {
      if (item.metaData) {
        item.metaData = JSON.parse(item.metaData);
      }
      return item;
    });

    const sources = JSON.parse(pipelineConfig.sources ?? '[]')[0];

    return {
      /** 研发阶段名称 */
      workflowName: item.name,
      /** 研发阶段sn */
      releaseStageSn: item.sn,
      /** 发起请求需要的params参数 */
      globalParams,
      /** 源码库id 在请求参数中作为设置分支名称 */
      sourcesID: sources.sign,
    };
  });

  return {
    /** 应用名称 */
    appName,
    /** 研发流程sn */
    releaseWorkflowSn: appConfig.sn,
    /** 研发阶段列表 */
    workflowStages: handleWorkflowSource,
  };
};
