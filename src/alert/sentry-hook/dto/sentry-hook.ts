import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export enum SentryHookType {
  Issue = 'issue',
  Error = 'error',
  Comment = 'comment',
  MetricAlert = 'metric_alert',
  EventAlert = 'event_alert',
  Installation = 'installation',
}
export enum SentryIssueAction {
  Created = 'created',
  Resolved = 'resolved',
  Assigned = 'assigned',
  Archived = 'archived',
  Unresolved = 'unresolved',
}
export enum SentryIssueAlertAction {
  Triggered = 'triggered',
}

export type SentryWebHookHeader = {
  'Sentry-Hook-Resource': SentryHookType;
  'Sentry-Hook-Signature': string;
  'Sentry-Hook-Timestamp': string;
  'Request-ID': string;
  'Content-Type': string;
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

export class SentryHookData {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Data type',
    enum: SentryHookDataType,
  })
  
}

export class SentryHookDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Sentry Hook动作',
  })
  action: string;
  @IsNotEmpty()
  @ApiProperty({
    description: 'Sentry Hook数据',
  })
  data: SentryHookData;
  @IsNotEmpty()
  @ApiProperty({
    type: SentryHookActor,
    description: 'Sentry Hook 操作者',
  })
  actor: SentryHookActor;
}
