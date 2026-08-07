import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export type ScheduledTaskStatus = 'enabled' | 'disabled';
export type ScheduledTaskRunResult = 'success' | 'failed';

/** 总控台定时任务列表查询条件。 */
export class GlobalAdminScheduleQueryDto {
  @ApiPropertyOptional({ description: '模块或功能描述关键字' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ enum: ['enabled', 'disabled'] })
  @IsOptional()
  @IsIn(['enabled', 'disabled'])
  status?: ScheduledTaskStatus;
}

/** 总控台定时任务执行日志查询条件。 */
export class GlobalAdminScheduleLogQueryDto {
  @ApiPropertyOptional({ enum: ['success', 'failed'] })
  @IsOptional()
  @IsIn(['success', 'failed'])
  result?: ScheduledTaskRunResult;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;
}

/** 总控台定时任务列表项。 */
export class GlobalAdminScheduleSummaryDto {
  @ApiProperty({ description: '任务唯一标识（jobName）' })
  taskKey: string;

  @ApiProperty({ description: '所属模块' })
  module: string;

  @ApiProperty({ description: '功能描述' })
  description: string;

  @ApiProperty({ description: '执行周期（cron 表达式）' })
  cron: string;

  @ApiProperty({ enum: ['enabled', 'disabled'] })
  status: ScheduledTaskStatus;

  @ApiProperty({ description: '上次执行时间' })
  lastRunTime: Date | null;

  @ApiProperty({ enum: ['success', 'failed'], nullable: true })
  lastRunResult: ScheduledTaskRunResult | null;
}

/** 总控台定时任务详情。 */
export class GlobalAdminScheduleDetailDto extends GlobalAdminScheduleSummaryDto {
  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

/** 总控台定时任务执行日志项。 */
export class GlobalAdminScheduleLogDto {
  @ApiProperty({ description: '日志 ID' })
  id: string;

  @ApiProperty({ description: '执行时间' })
  executeTime: Date;

  @ApiProperty({ enum: ['success', 'failed'] })
  result: ScheduledTaskRunResult;

  @ApiProperty({ description: '失败原因或附加信息' })
  message: string | null;

  @ApiProperty({ description: '执行耗时（毫秒）' })
  costMs: number | null;
}

/** 总控台定时任务执行日志分页结果。 */
export class GlobalAdminScheduleLogPageDto {
  @ApiProperty({ type: GlobalAdminScheduleLogDto, isArray: true })
  list: GlobalAdminScheduleLogDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;
}
