import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

class User {
  id: string;
  name: string;
}
export class LogOperatorDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '消息ID',
  })
  messageId: string; // 消息ID
  @IsNotEmpty()
  @ApiProperty({
    type: User,
    description: '用户信息',
  })
  user: User; // 操作用户
  // remark?: string; // 备注，非必填项
}
