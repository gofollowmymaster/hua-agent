import { Injectable } from '@nestjs/common';
import { AppWorkflowType } from '../../types/devops';
import { DevopsApiService } from '../ali-api/ali-devops.helper';
import { AliDevopsDto } from '../../dto/ali';

@Injectable()
export class DevopsOptionService {
  private readonly optinos: Record<string, AppWorkflowType[]> = {
    dev: [
      {
        appName: 'publish-admin-app',
        workflowName: 'dev环境',
        branch: 'dev-publish',
      },
      {
        appName: 'publish-user-app',
        workflowName: 'dev环境',
        branch: 'dev-publish',
      },
      {
        appName: 'global-console',
        workflowName: 'dev环境',
        branch: 'dev-publish',
      },
      {
        appName: 'aplus-quickbi-manage',
        workflowName: 'dev环境',
        branch: 'feature/dev-publish',
      },
    ],
    'dev-merge': [
      {
        appName: 'publish-admin-app',
        workflowName: 'dev-merge',
        branch: 'dev-merge-publish',
      },
      {
        appName: 'publish-user-app',
        workflowName: 'dev-merge',
        branch: 'dev-merge-publish',
      },
      {
        appName: 'publish-admin-tenant-app',
        workflowName: 'dev-merge环境',
        branch: 'dev-merge',
      },

      {
        appName: 'publish-user-tenant-app',
        workflowName: 'dev-merge环境',
        branch: 'dev-merge',
      },
      {
        appName: 'publish-admin-yurex-app',
        workflowName: 'dev环境',
        branch: 'dev-merge',
      },
      {
        appName: 'publish-user-yurex-app',
        workflowName: 'dev环境',
        branch: 'dev-merge',
      },
      {
        appName: 'global-console',
        workflowName: 'dev-v2环境',
        branch: 'dev-merge',
      },
      {
        appName: 'aplus-quickbi-manage',
        workflowName: 'dev-merge',
        branch: 'dev-merge',
      },
    ],
    test: [
      {
        appName: 'publish-admin-app',
        workflowName: 'test环境',
        branch: 'test-publish',
      },
      {
        appName: 'publish-user-app',
        workflowName: 'test环境',
        branch: 'test-publish',
      },
      {
        appName: 'global-console',
        workflowName: '服务器test环境',
        branch: 'dev-publish',
      },
      {
        appName: 'aplus-quickbi-manage',
        workflowName: 'test环境',
        branch: 'feature/test-publish',
      },
    ],
    'test-merge': [
      {
        appName: 'publish-admin-app',
        workflowName: '服务商test环境-小往',
        branch: 'test-merge-publish',
      },
      {
        appName: 'publish-user-app',
        workflowName: '服务商测试环境-小往',
        branch: 'test-merge-publish',
      },
      {
        appName: 'publish-admin-tenant-app',
        workflowName: '服务商测试环境',
        branch: 'test-merge',
      },
      {
        appName: 'publish-user-tenant-app',
        workflowName: '服务商测试环境',
        branch: 'test-merge',
      },
      {
        appName: 'publish-admin-yurex-app',
        workflowName: 'test环境',
        branch: 'test-merge',
      },
      {
        appName: 'publish-user-yurex-app',
        workflowName: 'test环境',
        branch: 'test-merge',
      },
      {
        appName: 'global-console',
        workflowName: 'test环境',
        branch: 'test-merge',
      },
      {
        appName: 'aplus-quickbi-manage',
        workflowName: '服务商test环境',
        branch: 'test-merge',
      },
    ],
    uat: [
      {
        appName: 'publish-admin-app',
        workflowName: 'uat环境',
        branch: 'uat-publish',
      },
      {
        appName: 'publish-user-app',
        workflowName: 'uat环境',
        branch: 'uat-publish',
      },
      {
        appName: 'publish-admin-tenant-app',
        workflowName: 'uat环境',
        branch: 'uat-publish',
      },
      {
        appName: 'publish-user-tenant-app',
        workflowName: 'uat环境',
        branch: 'uat-publish',
      },
      {
        appName: 'global-console',
        workflowName: 'uat环境',
        branch: 'uat-publish',
      },
      {
        appName: 'aplus-quickbi-manage',
        workflowName: 'UAT环境',
        branch: 'feature/uat-publish',
      },
    ],
  };
  constructor(private readonly devopsApiService: DevopsApiService) {}
  /**
   * 获取配置的选项
   * @param env
   * @param app
   * @returns
   */
  getOptions(env: string, apps?: string[]) {
    const options = this.optinos[env];
    if (apps) {
      return options.filter((item) => apps.includes(item.appName));
    }
    return options;
  }

  /**
   * 检查APP是否存在
   */
  async checkApp(params: AliDevopsDto) {
    const apps = await this.devopsApiService.quaryAllApp();
    const appNames = apps.data.map((item: any) => item.name);
    const runAppList = this.getOptions(params.env, params.apps);

    const notExistList = runAppList.reduce((prev, item) => {
      if (!appNames.includes(item.appName)) {
        prev.push(item.appName);
      }
      return prev;
    }, [] as string[]);

    if (notExistList.length) {
      throw new Error(
        `应用：${notExistList.join(',')}不存在，请检查应用配置是否正确`,
      );
    }
    return runAppList;
  }
}
