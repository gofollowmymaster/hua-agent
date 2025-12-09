import { Controller, Post, UseGuards } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import AlertStatisticService from '../common/schedule/alert-statistic';
import ClearAlertPerDayService from '../common/schedule/clear-alert-issue';
import { SecretAuthGuard } from '@src/common/guard/secret-auth';
import SyncFeishuUser from '../common/schedule/sync-feishu-user';

@ApiTags('飞书消息报警')
@Controller('alert-message')
export class AlertMsgController {
  constructor(
    private readonly alertStatisticService: AlertStatisticService,
    private readonly clearAlertPerDayService: ClearAlertPerDayService,
    private readonly syncFeishuUser: SyncFeishuUser,
  ) {}

  @ApiOperation({
    summary: '手动触发日报警统计',
    description: '手动触发日报警统计定时任务',
  })
  @Post('triggerStatistic')
  @UseGuards(SecretAuthGuard)
  async triggerStatistic() {
    this.alertStatisticService.handleCron(true);
  }

  @ApiOperation({
    summary: '手动触发清理日错误数量',
    description: '手动触发清理日错误数量定时任务',
  })
  @Post('triggerClearPerDay')
  @UseGuards(SecretAuthGuard)
  async triggerClearPerDay() {
    this.clearAlertPerDayService.handleCron(true);
  }
  @ApiOperation({
    summary: '手动触发同步飞书用户',
    description: '手动触发同步飞书用户定时任务',
  })
  @Post('triggerSyncFeishuUser')
  @UseGuards(SecretAuthGuard)
  async triggerSyncFeishuUser() {
    return this.syncFeishuUser.handleCron();
  }
}
