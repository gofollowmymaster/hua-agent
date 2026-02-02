import { AppWorkflowPublishType } from '../common/ali-api/interface';
import { AliDevopsDto } from '../dto/ali';

export interface AppWorkflowType {
  /** 应用名称 */
  appName: string;
  /** 流程名称 */
  workflowName: string;
  /** 流程参数 自定义将会覆盖默认参数 */
  metaData?: Record<string, string>;
  /** 分支名称 */
  branch: string;
}

export type PublishCardInfoType = {
  appReleaseWorkflowList: AppWorkflowPublishType[];
  params: AliDevopsDto;
  testUser: string;
};
