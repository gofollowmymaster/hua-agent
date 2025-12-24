import { ApiProperty } from '@nestjs/swagger';

export class WikiTreeDto {
  @ApiProperty({
    type: String,
    description: '飞书知识库ID',
  })
  spaceId: string;
  @ApiProperty({
    type: String,
    description: '是否强制刷新数据（不使用缓存）',
  })
  force: boolean;
}
