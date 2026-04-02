import { Injectable } from '@nestjs/common';
import { AppWorkflowType } from '../../types/devops';
import { DevopsApiService } from '../ali-api/ali-devops.helper';
import { AliDevopsDto } from '../../dto/ali';
import { cloneDeep } from 'lodash';

@Injectable()
export class DevopsOptionService {
  private readonly options: Record<string, AppWorkflowType[]> = {
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
        appName: 'publish-admin-tenant-app',
        workflowName: 'dev环境',
        branch: 'dev-publish',
      },
      {
        appName: 'publish-user-tenant-app',
        workflowName: 'dev环境',
        branch: 'dev-publish',
      },
      {
        appName: 'publish-admin-yurex-app',
        workflowName: 'dev环境',
        branch: 'dev-publish',
      },
      {
        appName: 'publish-user-yurex-app',
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
        branch: 'dev-publish',
      },
      {
        appName: 'aplus-login-center',
        workflowName: 'dev环境',
        branch: 'dev-publish',
      },
    ],

    test: [
      {
        appName: 'publish-admin-app',
        workflowName: '服务商test环境-小往',
        branch: 'test-publish',
      },
      {
        appName: 'publish-user-app',
        workflowName: '服务商测试环境-小往',
        branch: 'test-publish',
      },
      {
        appName: 'publish-admin-tenant-app',
        workflowName: '服务商测试环境',
        branch: 'test-publish',
      },
      {
        appName: 'publish-user-tenant-app',
        workflowName: '服务商测试环境',
        branch: 'test-publish',
      },
      {
        appName: 'publish-admin-yurex-app',
        workflowName: 'test环境',
        branch: 'test-publish',
      },
      {
        appName: 'publish-user-yurex-app',
        workflowName: 'test环境',
        branch: 'test-publish',
      },
      {
        appName: 'global-console',
        workflowName: '服务商test环境',
        branch: 'test-publish',
      },
      {
        appName: 'aplus-quickbi-manage',
        workflowName: 'test环境',
        branch: 'test-publish',
      },
      {
        appName: 'aplus-login-center',
        workflowName: 'test-com 环境',
        branch: 'test-publish',
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
        appName: 'publish-admin-yurex-app',
        workflowName: 'uat环境',
        branch: 'uat-publish',
      },
      {
        appName: 'publish-user-yurex-app',
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
        branch: 'uat-publish',
      },
      {
        appName: 'aplus-login-center',
        workflowName: 'uat环境',
        branch: 'uat-publish',
      },
    ],
    prod: [
      {
        appName: 'publish-admin-app',
        workflowName: 'PROD环境',
        branch: 'master',
      },
      {
        appName: 'publish-user-app',
        workflowName: 'PROD环境',
        branch: 'master',
      },
      {
        appName: 'publish-admin-tenant-app',
        workflowName: 'boat生产环境',
        branch: 'master',
      },
      {
        appName: 'publish-user-tenant-app',
        workflowName: 'boat生产环境',
        branch: 'master',
      },
      {
        appName: 'publish-admin-yurex-app',
        workflowName: 'PROD环境',
        branch: 'master',
      },
      {
        appName: 'publish-user-yurex-app',
        workflowName: 'PROD环境',
        branch: 'master',
      },
      {
        appName: 'test-admin-publish-app',
        workflowName: '正式环境',
        branch: 'master',
      },
      {
        appName: 'test-user-publish-app',
        workflowName: '正式环境',
        branch: 'master',
      },
      {
        appName: 'global-console',
        workflowName: '正式环境',
        branch: 'master',
      },

      // {
      //   appName: 'aplus-quickbi-manage',
      //   workflowName: '正式环境',
      //   branch: 'master',
      // },
      // {
      //   appName: 'aplus-login-center',
      //   workflowName: '正式环境',
      //   branch: 'master',
      // },
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
    const options = this.options[env];
    if (apps) {
      return options.filter((item) => apps.includes(item.appName));
    }
    return options;
  }

  getOptionExcludeDev() {
    const options = cloneDeep(this.options);
    delete options.dev;
    delete options['dev-merge'];
    return options;
  }

  /**
   * 检查APP是否存在
   */
  async checkApp(params: AliDevopsDto) {
    const apps = await this.devopsApiService.queryAllApp();
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
