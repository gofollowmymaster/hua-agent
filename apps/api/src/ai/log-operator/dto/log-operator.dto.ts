import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export enum Environment {
  PRODUCTION = 'production',
  UAT = 'uat',
  TEST = 'test',
  DEV = 'dev',
}
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
  @ApiPropertyOptional({
    enum: Environment,
    description: '环境',
  })
  env: Environment; // 环境
  // remark?: string; // 备注，非必填项
}
