import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AliService } from './ali.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AliDevopsByFeishuDto,
  AliDevopsCommonDto,
  PublishCreateDataDto,
} from './dto/ali';
import { SecretAuthGuard } from '@src/common/guard/secret-auth';
import { sendCommonCardToFeishu } from '@src/common/feishu/utils';
import { AliDevopsContext } from './common/service/ali-devops.context';
import DevopsPublishLogTable from './common/table/devops-publish-log-table';

@Controller('devops')
@ApiTags('阿里云效自动化')
export class AliController {
  constructor(
    private aliService: AliService,
    protected devopsContext: AliDevopsContext,
    protected devopsPublishLogTable: DevopsPublishLogTable,
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
        message: '失败：' + error.message,
        body: [],
      };
    }
  }

  @Post('create')
  @ApiOperation({
    summary: '创建发布记录',
    description: '创建发布记录',
  })
  @ApiBody({ type: PublishCreateDataDto })
  @UseGuards(SecretAuthGuard)
  async createToTable(@Body() params: PublishCreateDataDto) {
    return this.devopsPublishLogTable.create(params.records, {
      user_id_type: 'union_id',
    });
  }
}
