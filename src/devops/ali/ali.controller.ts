import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AliService } from './ali.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AliDevopsByFeishuDto, AliDevopsCommonDto } from './dto/ali';
import { SecretAuthGuard } from '@src/common/guard/secret-auth';
import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import CancelExecutionServer from './common/schedule/cancel-execution';
import { AliDevopsContext } from './common/service/ali-devops.context';

@Controller('devops')
@ApiTags('阿里云效自动化')
export class AliController {
  constructor(
    private aliService: AliService,
    protected cancelExecutionServer: CancelExecutionServer,
    protected devopsContext: AliDevopsContext,
  ) {}

  @Post('publish')
  @ApiOperation({
    summary: '应用交付',
    description: '通过飞书表格应用交付',
  })
  @ApiBody({ type: AliDevopsByFeishuDto })
  @UseGuards(SecretAuthGuard)
  async publish(@Body() params: AliDevopsByFeishuDto) {
    params.apps = params.appsStr?.split(',');
    params.testUser = params.testUserStr?.split(',');
    if (params.testUser && params.testUser.length > 5) {
      params.testUser = params.testUser.slice(0, 5);
    }
    return this.publishV2(params);
  }
  @Post('publish-v2')
  @ApiOperation({
    summary: '通用应用交付',
    description: '应用交付',
  })
  @ApiBody({ type: AliDevopsCommonDto })
  @UseGuards(SecretAuthGuard)
  async publishV2(@Body() params: AliDevopsCommonDto) {
    try {
      const res = await this.aliService.publish(params);
      return {
        code: 200,
        message: '运行中',
        body: res.map((item) => ({
          appName: item.appName,
          workflowName: item.workflowName,
          url: item.url,
          status: item.status,
        })),
      };
    } catch (error) {
      sendCommonCardToFeishu({
        title: '应用发布异常',
        project: process.env.PROJECT_NAME,
        color: 'red',
        message: error.message,
        content: error.stack,
      });
      return {
        code: 500,
        message: '失败',
        body: [],
      };
    }
  }

  @Post('cancel-runs')
  @ApiOperation({
    summary: '批量取消等待中流水线',
    description: '手动触发批量取消等待中流水线',
  })
  // @ApiBody({ type: AliDevopsCommonDto })
  @UseGuards(SecretAuthGuard)
  async cancelRuns() {
    const res = this.devopsContext.run(
      {
        token:
          'pt-jgoR3UlxLAGU184xIjaPWgWf_0966a36a-6aff-4755-848a-f140610e3a08',
      },
      async () => {
        await this.cancelExecutionServer.handleCron(true);
      },
    );

    return res;
  }
}
