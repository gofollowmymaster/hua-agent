import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { AlertMsgService } from './alert-message.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SentryRawDto } from './dto/sentry-raw.dto';
import { AlertEvent, ErrorEndpoint } from '../common/type/alert';
import { getModuleNameByUrl } from '../common/utils';
import AlertStatisticService from '../common/schedule/alert-statistic';
import ClearAlertPerDayService from '../common/schedule/clear-alert-issue';
import { SecretAuthGuard } from '@src/common/guard/secret-auth';
import SyncFeishuUser from '../common/schedule/sync-feishu-user';

@ApiTags('飞书消息报警')
@Controller('alert-message')
export class AlertMsgController {
  constructor(
    private readonly alertMsgService: AlertMsgService,
    private readonly alertStatisticService: AlertStatisticService,
    private readonly clearAlertPerDayService: ClearAlertPerDayService,
    private readonly syncFeishuUser: SyncFeishuUser,
  ) {}

  @ApiOperation({
    summary: 'sentry直连报警消息通知',
    description: '处理sentry报警消息通知',
  })
  @ApiBody({ type: SentryRawDto })
  @Post('alertRaw')
  async sentryAlert(@Body() alertInfo: SentryRawDto) {
    return;
    const event = alertInfo.event;
    const urlParsed = alertInfo.url?.split('?');
    const eventUrl =
      urlParsed[0] + 'events/' + event?.event_id + '?' + urlParsed[1];

    const requestData = alertInfo.event.extra?.__serialized__;
    const serverModuleName = getModuleNameByUrl(requestData?.url);

    const eventData: AlertEvent = {
      ...alertInfo.event,
      title: alertInfo.message,
      // issue_url: alertInfo.url,
      webUrl: eventUrl,
      issueUrl: alertInfo.url,
      issueId: alertInfo.id,
      requestData,
      pageModuleName: alertInfo.event.extra?.subModuleName || '',
      serverModuleName,
      errorEndpoint: alertInfo.event.extra?.errorEndpoint || ErrorEndpoint.Page,
      rawData: alertInfo,
    };
    // return;
    return await this.alertMsgService.sentryAlertHook(eventData);
  }

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
