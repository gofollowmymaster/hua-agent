import { ApiProperty } from '@nestjs/swagger';

export class WikiDto {
  @ApiProperty({
    type: String,
    description: '飞书知识库ID',
  })
  spaceId?: string; // 消息ID
}
