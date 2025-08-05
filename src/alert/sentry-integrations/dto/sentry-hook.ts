import { ApiProperty } from '@nestjs/swagger';
import {
  SentryComment,
  SentryEvent,
  SentryIssue,
} from '@src/alert/common/type/sentry';
import { IsNotEmpty } from 'class-validator';

export enum SentryHookType {
  Issue = 'issue',
  Error = 'error',
  Comment = 'comment',
  MetricAlert = 'metric_alert',
  EventAlert = 'event_alert',
  Installation = 'installation',
}

export type SentryWebHookHeader = {
  'sentry-hook-resource': SentryHookType;
  'sentry-hook-signature': string;
  'sentry-hook-timestamp': string;
  'request-id': string;
  'content-type': string;
};

enum SentryHookActorType {
  User = 'user',
  Application = 'application',
}
export class SentryHookActor {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Actor type',
    enum: SentryHookActorType,
  })
  type: SentryHookActorType;
  @IsNotEmpty()
  @ApiProperty({
    description: 'Actor id',
    type: String,
  })
  'id': string;
  @IsNotEmpty()
  @ApiProperty({
    description: 'Actor name',
    enum: String,
  })
  'name': string;
}

export class SentryInstallationData {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Installation id',
    type: String,
  })
  'uuid': string;
}
enum SentryEventAction {
  Created = 'created',
  Resolved = 'resolved',
  Ignored = 'ignored',
  Assigned = 'assigned',
  Updated = 'updated',
  Deleted = 'deleted',
  Triggered = 'triggered',
  Critical = 'critical',
  Warning = 'warning',
}
export class SentryHookDto {
  @IsNotEmpty()
  @ApiProperty({
    enum: SentryEventAction,
    description: 'Sentry Hook动作',
  })
  action: SentryEventAction;
  @IsNotEmpty()
  @ApiProperty({
    description: 'Sentry Hook数据',
  })
  data: any;
  @IsNotEmpty()
  @ApiProperty({
    type: SentryHookActor,
    description: 'Sentry Hook 操作者',
  })
  actor: SentryHookActor;
  @IsNotEmpty()
  @ApiProperty({
    type: SentryInstallationData,
    description: 'Sentry 集成信息',
  })
  installation: SentryInstallationData;
}

export class SentryHookErrorDto extends SentryHookDto {
  data: {
    error: SentryEvent;
  };
}

export class SentryHookCommentDto extends SentryHookDto {
  data: SentryComment;
}

export class SentryHookIssueDto extends SentryHookDto {
  data: SentryIssue;
}
