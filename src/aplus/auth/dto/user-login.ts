import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UserLoginDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '用户名',
  })
  userName: string; // 用户名
  @ApiProperty({
    type: String,
    description: '密码',
  })
  password: string; // 操作用户
  @ApiProperty({
    type: String,
    description: '平台',
  })
  platform: string; // 平台
}
