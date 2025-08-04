import { Body, Controller, Post } from '@nestjs/common';

import { AlertMsgService } from './alert-message.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SentryRawDto } from './dto/sentry-raw.dto';
import {
  AlertEvent,
  ErrorEndpoint,
  PageModuleName,
} from '../common/type/alert';
import { getModuleNameByUrl } from '../common/utils';
import { SentryAlertDto } from './dto/sentry-alert.dto';

@ApiTags('飞书消息报警')
@Controller('alert-message')
export class AlertMsgController {
  constructor(private readonly alertMsgService: AlertMsgService) {}

  @ApiOperation({
    summary: 'sentry直连报警消息通知',
    description: '处理sentry报警消息通知',
  })
  @ApiBody({ type: SentryRawDto })
  @Post('alertRaw')
  async sentryAlert(@Body() alertInfo: SentryRawDto) {
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
      web_url: eventUrl,
      issue_id: alertInfo.id,
      requestData,
      pageModuleName:
        alertInfo.event.extra?.subModuleName || PageModuleName.APLUS_OTHER,
      serverModuleName,
      errorEndpoint: alertInfo.event.extra?.errorEndpoint || ErrorEndpoint.Page,
    };
    return;
    return await this.alertMsgService.sentryAlertHook(eventData);
  }
}
