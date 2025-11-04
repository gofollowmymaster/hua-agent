import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FeishuPushDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '文档标识',
  })
  tag: string;
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '模块标识',
  })
  module: string;

  @ApiProperty({
    type: String,
    description: '标题',
  })
  title?: string;
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'content',
  })
  content: string;
}
