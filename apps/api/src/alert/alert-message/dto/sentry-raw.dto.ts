import { ApiProperty } from '@nestjs/swagger';
import { SentryEvent } from '@src/alert/common/type/sentry-issue';
import { ErrorLevel } from '@src/common/base/interface';
import { IsNotEmpty, IsNotEmptyObject } from 'class-validator';

export class SentryRawDto {
  @ApiProperty({
    type: String,
    description: 'sentry 打点数据',
  })
  culprit: string;
  @ApiProperty({
    type: SentryEvent,
    description: 'sentry事件信息',
  })
  @IsNotEmptyObject()
  event: SentryEvent;
  @ApiProperty({
    type: String,
    description: 'sentryID',
  })
  id: string;
  @ApiProperty({
    enum: ErrorLevel,
    description: '报警级别',
  })
  level: ErrorLevel;
  logger: null;
  @ApiProperty({
    type: String,
    description: 'sentry事件文案消息',
  })
  @IsNotEmpty()
  message: string;
  @ApiProperty({
    type: String,
    description: 'sentry事件所属项目',
  })
  project: string;
  project_name: string;
  project_slug: string;
  @ApiProperty({
    type: Array<string>,
    description: 'sentry事件触发规则',
  })
  triggering_rules: string[];
  @ApiProperty({
    type: String,
    description: 'sentry页面连接',
  })
  @IsNotEmpty()
  readonly url: string;
}

export class updateIssueDto {}
