import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FeishuPushDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'tag',
  })
  tag: string;
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '标题',
  })
  title: string;
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'content',
  })
  content: string;
}
