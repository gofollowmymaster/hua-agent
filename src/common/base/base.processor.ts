import { Injectable, Logger } from '@nestjs/common';
import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import {
  TenantContext,
  TenantContextType,
} from '@src/common/service/context/tenant.context';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NodeConfigService } from '@src/config/node-config.service';

@Injectable()
export default abstract class BaseProcessor extends WorkerHost {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected readonly tenantContext: TenantContext) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    this.logger.debug(this.constructor.name + ' Called ');
    const { tenantCode } = job.data;
    const tenantData = {
      tenantCode,
    };
    this.tenantContext.run(tenantData, async () => {
      this.handle(job.data, tenantData);
    });
  }

  protected abstract handle(data: any, context?: any);

  protected sendAlertMsg(message: string, content: string) {
    sendCommonCardToFeishu({
      title: '队列任务报警',
      project: process.env.PROJECT_NAME,
      color: 'red',
      message: message,
      content: content,
    });
  }
}
