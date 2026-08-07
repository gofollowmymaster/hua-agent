import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GlobalAdminGuard } from '../common/guard/global-admin.guard';
import { GLOBAL_ADMIN_ROUTE_PREFIX } from '../global-admin.constants';
import {
  GlobalAdminScheduleDetailDto,
  GlobalAdminScheduleLogPageDto,
  GlobalAdminScheduleLogQueryDto,
  GlobalAdminScheduleQueryDto,
  GlobalAdminScheduleSummaryDto,
} from './dto/schedule.dto';
import { GlobalAdminScheduleService } from './schedule.service';

/** 提供不依赖 TenantContext 的定时任务管理接口。 */
@ApiTags('Global Admin 定时任务管理')
@UseGuards(GlobalAdminGuard)
@Controller(GLOBAL_ADMIN_ROUTE_PREFIX)
export class GlobalAdminScheduleController {
  constructor(private readonly scheduleService: GlobalAdminScheduleService) {}

  /** 查询定时任务列表。 */
  @Get('schedules')
  @ApiOperation({ summary: '查询定时任务列表' })
  @ApiOkResponse({ type: GlobalAdminScheduleSummaryDto, isArray: true })
  listSchedules(@Query() query: GlobalAdminScheduleQueryDto) {
    return this.scheduleService.list(query);
  }

  /** 查询定时任务详情。 */
  @Get('schedules/:taskKey')
  @ApiOperation({ summary: '查询定时任务详情' })
  @ApiOkResponse({ type: GlobalAdminScheduleDetailDto })
  getSchedule(@Param('taskKey') taskKey: string) {
    return this.scheduleService.get(taskKey);
  }

  /** 手动触发定时任务。 */
  @Post('schedules/:taskKey/trigger')
  @ApiOperation({ summary: '手动触发定时任务' })
  @ApiOkResponse({ type: GlobalAdminScheduleDetailDto })
  triggerSchedule(@Param('taskKey') taskKey: string) {
    return this.scheduleService.trigger(taskKey);
  }

  /** 查询定时任务执行日志。 */
  @Get('schedules/:taskKey/logs')
  @ApiOperation({ summary: '查询定时任务执行日志' })
  @ApiOkResponse({ type: GlobalAdminScheduleLogPageDto })
  listScheduleLogs(
    @Param('taskKey') taskKey: string,
    @Query() query: GlobalAdminScheduleLogQueryDto,
  ) {
    return this.scheduleService.listLogs(taskKey, query);
  }
}
