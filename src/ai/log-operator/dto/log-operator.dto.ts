import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LogOperatorDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '消息ID',
  })
  messageId: string; // 消息ID
  @ApiProperty({
    type: String,
    description: '用户名',
  })
  userName: string; // 操作用户
  @ApiProperty({
    type: String,
    description: '供应商',
  })
  tenantName: string; // 供应商
  // remark?: string; // 备注，非必填项
}
