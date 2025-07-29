import { ApiProperty } from '@nestjs/swagger';
import { SentryEvent } from '@src/alert/alert-message/dto/sentry-raw.dto';
import { IsNotEmpty } from 'class-validator';
import { extend } from 'dayjs';

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

// export class SentryHookErrorData {
//   @IsNotEmpty()
//   @ApiProperty({
//     description: 'Data type',
//     enum: SentryHookDataType,
//   })

// }

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
