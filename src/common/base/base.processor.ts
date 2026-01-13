import { Injectable, Logger } from '@nestjs/common';
import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { OnWorkerEvent, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ProcessorBody } from '@src/type/global';

@Injectable()
export default abstract class BaseProcessor extends WorkerHost {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected readonly tenantContext: TenantContext) {
    super();
  }

  async process(job: Job<ProcessorBody>): Promise<any> {
    this.logger.debug(this.constructor.name + ' Called ');
    const { tenantCode } = job.data;
    const tenantData = {
      tenantCode,
    };
    this.tenantContext.run(tenantData, async () => {
      this.handle(job.data);
    });
  }

  protected abstract handle(data: ProcessorBody);

  protected sendAlertMsg(message: string, content: string) {
    sendCommonCardToFeishu({
      title: '队列任务报警',
      project: process.env.PROJECT_NAME,
      color: 'red',
      message: message,
      content: content,
    });
  }

  @OnWorkerEvent('active')
  onJobActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}`,
    );
  }
  @OnWorkerEvent('completed')
  onJobCompleted(job: Job) {
    console.log(`Job ${job.id} completed with result:`, job.returnvalue);
  }

  @OnWorkerEvent('failed')
  onJobFailed(job: Job, error: Error) {
    console.error(`Job ${job.id} failed with error:`, error.message);
  }
}
