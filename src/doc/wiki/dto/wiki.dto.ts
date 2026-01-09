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
export class WikiSearchDto {
  @ApiProperty({
    type: String,
    description: '飞书知识空间ID',
  })
  spaceId: string;
  @ApiProperty({
    type: String,
    description: '搜索关键词',
  })
  query: string;
  @ApiProperty({
    type: String,
    description: '子节点Id',
  })
  nodeId?: string;
}
