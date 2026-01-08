import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventHandles } from '@larksuiteoapi/node-sdk';
type EventType = keyof EventHandles;
export class FeishuEventHeader {
  @ApiProperty({
    type: String,
    description: '飞书事件ID',
  })
  event_id: string;
  @ApiProperty({
    type: String,
    description: '飞书事件类型',
  })
  event_type: EventType;
  create_time: string;
  token: string;
  @ApiProperty({
    type: String,
    description: '飞书APPID',
  })
  app_id: string;
  @ApiProperty({
    type: String,
    description: '租户',
  })
  tenant_key: string;
}

export class FeishuEventCallbackBase {
  @ApiPropertyOptional({
    type: String,
    description: '版本',
  })
  schema: string;
  @ApiProperty({
    type: FeishuEventHeader,
    description: '飞书事件Header',
  })
  header: FeishuEventHeader;
  @ApiPropertyOptional({
    type: FeishuEventHeader,
    description: '',
  })
  challenge?: string;
  type?: string;
}

export class FeishuEventCallbackDto extends FeishuEventCallbackBase {
  @ApiPropertyOptional({
    type: Object,
    description: '事件主体信息',
  })
  event: any;
}
