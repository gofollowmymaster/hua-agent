import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  event_type: string;
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

class CallbackValueDto {
  @ApiProperty({
    type: String,
  })
  'action': string;
  @ApiProperty({
    type: String,
  })
  'issueId': string;
}
class CallbackActionDto {
  @ApiProperty({
    type: CallbackValueDto,
    description: '回调的触发动作信息',
  })
  value: CallbackValueDto;

  @ApiProperty({
    type: String,
    description: '回调的触发标签',
  })
  tag: string;
  @ApiProperty({
    type: String,
    description: '回调的选项值',
  })
  option?: string;
  @ApiProperty({
    type: Object,
    description: '回调的表单值',
  })
  form_value?: Record<string, any>;
}
class CallbackContext {}
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
  @ApiProperty({
    type: String,
    description: '新卡片用的凭证，有效期为 30 分钟，最多可更新 2 次',
  })
  token: string;
  @ApiPropertyOptional({
    type: String,
    description:
      '卡片分发类型，固定取值为 url_preview，表示链接预览卡片仅链接预览卡片有此字段',
  })
  delivery_type?: string;
  @ApiPropertyOptional({
    type: String,
    description: '用户操作交互组件回传的数据',
  })
  action?: CallbackActionDto;
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
  [key: string]: any;
}
