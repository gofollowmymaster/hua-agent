import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class WikiDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '飞书知识库ID',
  })
  spaceId: string; // 消息ID
}
