import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventHandles } from '@larksuiteoapi/node-sdk';
type EventType = keyof EventHandles;
export class FeishuCallbackHeader {
  @ApiProperty({
    type: String,
    description: '对应 Verification Token',
  })
  token: string;

  @ApiProperty({
    type: String,
    description: '回调类型',
  })
  event_type: EventType;
  @ApiProperty({
    type: String,
    description: '回调发送的时间戳，近似于回调触发的时间',
  })
  create_time: string;
  @ApiProperty({
    type: String,
    description: '回调所属应用的应用id',
  })
  app_id: string;
  @ApiProperty({
    type: String,
    description: '回调所属应用的租户id',
  })
  tenant_key: string;
}

class CallbackOperator {
  'tenant_key': string;
  'user_id': string;
  'open_id': string;
}

type CallbackHost = 'im_message' | 'im_top_notice';
class CallbackContext {
  'url': string; //匹配URL规则的原链接
  'preview_token': string; //用于标识链接预览的凭证，在返回链接预览数据时要用
  'open_message_id': string; //触发链接预览的消息ID
  'open_chat_id': string; //触发链接预览的群ID
}
export class CallbackEventDto {
  @ApiProperty({
    type: Object,
    description: '回调的触发者',
  })
  operator: CallbackOperator;
  @ApiProperty({
    type: Object,
    description: '回调的宿主场景',
  })
  host: CallbackHost;
  @ApiProperty({
    type: Object,
    description: '场景下具体的上下文参数',
  })
  context: CallbackContext;
}

export class FeishuCallbackDto {
  @ApiPropertyOptional({
    type: String,
    description: '版本',
  })
  schema: string;
  @ApiProperty({
    type: FeishuCallbackHeader,
    description: '飞书回调Header',
  })
  header: FeishuCallbackHeader;
  @ApiPropertyOptional({
    type: String,
    description: '回调的挑战码，只有在验证飞书回调时需要',
  })
  challenge?: string;
  @ApiProperty({
    type: CallbackEventDto,
    description: '不同回调类型返回的详细的上下文信息',
  })
  event: CallbackEventDto;
  type?: string;
}
