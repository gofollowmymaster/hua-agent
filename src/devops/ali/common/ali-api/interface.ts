export type Playload = {
  /** 环境名称 */
  APP_ENV_NAME: string;
  /** 标签头 */
  e_tag_header: string;
  /** 流水线运行备注 */
  FLOW_INST_RUNNING_COMMENT?: string;
  /** 其他参数 分支名称等 */
  [key: string]: string | undefined;
};
